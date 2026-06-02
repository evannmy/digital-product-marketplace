<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;

class TransactionController extends Controller
{
    // =========================================================================
    // --- 1. THE BUYER'S LIBRARY (My Purchases) ---
    // =========================================================================

    public function index(Request $request)
    {
        $user = $request->user();

        // =====================================================================
        // --- NEW: RIGOROUS SELF-HEALING EXPIRATION CHECK ---
        // =====================================================================
        $expiredOrders = \App\Models\Order::where('buyer_id', $user->id)
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subHours(24))
            ->get();

        if ($expiredOrders->isNotEmpty()) {
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);

            foreach ($expiredOrders as $expiredOrder) {
                // Beritahu Midtrans untuk membatalkan token yang mungkin masih aktif
                if ($expiredOrder->midtrans_order_id) {
                    try {
                        \Midtrans\Transaction::cancel($expiredOrder->midtrans_order_id);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning("Midtrans auto-cancel failed for {$expiredOrder->midtrans_order_id}: " . $e->getMessage());
                    }
                }

                // Perbarui database lokal
                $expiredOrder->update([
                    'status' => 'cancelled',
                    'snap_token' => null
                ]);
            }
        }

        // --- PENDING ORDERS ---
        $pendingOrders = \App\Models\Order::with([
            'items.product' => function ($query) {
                $query->withTrashed()->with(['media', 'seller']);
            }
        ])
            ->where('buyer_id', $user->id)
            ->whereIn('status', ['pending'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'date' => $order->created_at->format('M j, Y'),
                    'created_at' => $order->created_at,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'title' => $item->product ? $item->product->title : 'Deleted Product',
                            'product' => $item->product,
                        ];
                    })
                ];
            });

        // --- YOUR DIGITAL LIBRARY ---
        $query = \App\Models\OrderItem::with([
            'order',
            'product' => function ($query) {
                $query->withTrashed()->with(['category', 'seller', 'media']);
            }
        ])
            ->whereHas('order', function ($orderQuery) use ($user) {
                $orderQuery->where('buyer_id', $user->id)
                    ->where('status', 'success');
            });

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';

            $query->whereHas('product', function ($q) use ($searchTerm) {
                $q->withTrashed()
                    ->where('title', 'like', $searchTerm)
                    ->orWhereHas('seller', function ($sellerQuery) use ($searchTerm) {
                        $sellerQuery->where('name', 'like', $searchTerm);
                    });
            });
        }

        $sort = $request->input('sort', 'newest');

        match ($sort) {
            'oldest' => $query->oldest(),
            'newest' => $query->latest(),
            default  => $query->latest(),
        };

        $transactions = $query->paginate(12)->withQueryString();

        return Inertia::render('purchases/index', [
            'transactions' => $transactions,
            'pendingOrders' => $pendingOrders,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort
            ],
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    // =========================================================================
    // --- 2. CHECKOUT LOGIC ---
    // =========================================================================

    /**
     * SHOPPING CART CHECKOUT (Multiple Items)
     */
    public function checkout(Request $request)
    {
        $user = $request->user();
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->back()->with('error', __('Your cart is empty.'));
        }

        // --- DITAMBAHKAN: Validasi item yang dipilih dari frontend ---
        $request->validate([
            'selected_item_ids' => 'required|array|min:1',
            'selected_item_ids.*' => 'integer|exists:cart_items,id'
        ]);

        $selectedItemIds = $request->input('selected_item_ids');

        // --- DITAMBAHKAN: Filter item keranjang HANYA yang dipilih user ---
        $itemsToCheckout = $cart->items->whereIn('id', $selectedItemIds);

        if ($itemsToCheckout->isEmpty()) {
            return redirect()->back()->with('error', __('Please select at least one valid item to checkout.'));
        }

        $platformCutPercentage = Setting::getPlatformCut();

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            $validItems = [];

            // --- DIPERBAIKI: Loop menggunakan $itemsToCheckout, bukan $cart->items ---
            foreach ($itemsToCheckout as $item) {
                $product = $item->product;

                if (!$product || !$product->is_active) {
                    throw new \Exception(__("Product ':title' is unavailable.", ['title' => $product->title]));
                }

                if ($user->id === $product->seller_id) {
                    throw new \Exception(__("You cannot purchase your own product: ':title'.", ['title' => $product->title]));
                }

                // SECURITY: Already owned?
                $alreadyBought = OrderItem::whereHas('order', function ($q) use ($user) {
                    $q->where('buyer_id', $user->id)->where('status', 'success');
                })->where('product_id', $product->id)->exists();

                if ($alreadyBought) {
                    throw new \Exception(__("You already own ':title'.", ['title' => $product->title]));
                }

                // SECURITY: Pending order?
                $hasPendingOrder = OrderItem::whereHas('order', function ($q) use ($user) {
                    $q->where('buyer_id', $user->id)->where('status', 'pending');
                })->where('product_id', $product->id)->exists();

                if ($hasPendingOrder) {
                    throw new \Exception(__("You have a pending order for ':title'. Please complete or cancel it first.", ['title' => $product->title]));
                }

                $finalPrice = $product->is_discount_active ? $product->discount_price : $product->price;
                $totalAmount += $finalPrice;

                $platformFee = $finalPrice * ($platformCutPercentage / 100);
                $sellerEarnings = $finalPrice - $platformFee;

                $validItems[] = [
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'price' => $finalPrice,
                    'platform_fee' => $platformFee,
                    'seller_earnings' => $sellerEarnings,
                ];
            }

            $order = Order::create([
                'buyer_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            foreach ($validItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'seller_id' => $item['seller_id'],
                    'price' => $item['price'],
                    'platform_fee' => $item['platform_fee'],
                    'seller_earnings' => $item['seller_earnings'],
                    'quantity' => 1,
                ]);
            }

            // --- DIPERBAIKI: HANYA hapus item yang di-checkout ---
            \App\Models\CartItem::whereIn('id', $selectedItemIds)->delete();

            // Opsional: Hapus entitas Cart jika sudah tidak ada item sama sekali
            if ($cart->items()->count() === 0) {
                $cart->delete();
            }

            DB::commit();

            return redirect()->route('orders.pay', $order->id)
                ->with('success', __('Order placed! Proceeding to secure checkout...'));
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('cart.index')->with('error', __('Checkout failed: :message', ['message' => $e->getMessage()]));
        }
    }

    /**
     * DIRECT CHECKOUT (Buy It Now Button)
     */
    public function directCheckout(Request $request, Product $product)
    {
        $user = $request->user();

        if (!$product->is_active) {
            return back()->with('error', __('This product is currently unavailable.'));
        }

        if ($user->id === $product->seller_id) {
            return back()->with('error', __('You cannot purchase your own product.'));
        }

        // SECURITY: Already owned? 
        $alreadyBought = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('buyer_id', $user->id)->where('status', 'success');
        })->where('product_id', $product->id)->exists();

        if ($alreadyBought) {
            return back()->with('error', __('You already own this product.'));
        }

        // SECURITY: Pending order? 
        $hasPendingOrder = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('buyer_id', $user->id)->where('status', 'pending');
        })->where('product_id', $product->id)->exists();

        if ($hasPendingOrder) {
            return back()->with('error', __('You already have a pending order for this product. Please complete or cancel it first.'));
        }

        $finalPrice = $product->is_discount_active ? $product->discount_price : $product->price;

        $platformCutPercentage = Setting::getPlatformCut();
        $platformFee = $finalPrice * ($platformCutPercentage / 100);
        $sellerEarnings = $finalPrice - $platformFee;

        DB::beginTransaction();

        try {
            $order = Order::create([
                'buyer_id' => $user->id,
                'total_amount' => $finalPrice,
                'status' => 'pending',
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'seller_id' => $product->seller_id,
                'price' => $finalPrice,
                'platform_fee' => $platformFee,
                'seller_earnings' => $sellerEarnings,
                'quantity' => 1,
            ]);

            DB::commit();

            return redirect()->route('orders.pay', $order->id)
                ->with('success', __('Order placed! Proceeding to secure checkout...'));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', __('Purchase failed. Please try again.'));
        }
    }

    // =========================================================================
    // --- 3. PAYMENT PROCESSING (Midtrans) ---
    // =========================================================================

    /**
     * Show the Payment Page with Midtrans Snap
     */
    public function showPaymentPage(Request $request, Order $order)
    {
        if ($request->user()->id !== $order->buyer_id) {
            abort(403, __('Unauthorized action.'));
        }

        if ($order->status === 'success') {
            return redirect()->route('purchases.index')->with('info', __('This order is already paid.'));
        }

        if ($order->status === 'cancelled') {
            return redirect()->route('purchases.index')->with('error', __('This order has been cancelled. Please start a new checkout.'));
        }

        // =====================================================================
        // --- RIGOROUS DIRECT ACCESS TIME GUARD ---
        // =====================================================================
        if ($order->status === 'pending' && $order->created_at < now()->subHours(24)) {

            // Batalkan di Midtrans terlebih dahulu
            if ($order->midtrans_order_id) {
                Config::$serverKey = env('MIDTRANS_SERVER_KEY');
                Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
                try {
                    \Midtrans\Transaction::cancel($order->midtrans_order_id);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Midtrans time guard cancel failed: " . $e->getMessage());
                }
            }

            // Lalu batalkan di lokal
            $order->update([
                'status' => 'cancelled',
                'snap_token' => null
            ]);

            return redirect()->route('purchases.index')
                ->with('error', __('Payment time limit (24 hours) has expired. The order has been cancelled.'));
        }

        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        if (!$order->snap_token) {

            $itemDetails = [];
            foreach ($order->items as $item) {
                $itemDetails[] = [
                    'id'       => $item->product_id,
                    'price'    => (int) $item->price,
                    'quantity' => (int) $item->quantity,
                    'name'     => substr($item->product->title ?? 'Digital Product', 0, 50),
                ];
            }

            // --- FIX 1: Generate ID yang bisa dilacak & simpan ke database ---
            $midtransOrderId = 'SOKO-' . $order->id . '-' . bin2hex(random_bytes(4));

            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) $order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                ],
                'item_details' => $itemDetails,
            ];

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                // SIMPAN midtrans_order_id ke database lokal!
                $order->update([
                    'snap_token' => $snapToken,
                    'midtrans_order_id' => $midtransOrderId
                ]);
            } catch (\Exception $e) {
                return back()->with('error', __('Failed to generate payment token: :message', ['message' => $e->getMessage()]));
            }
        }

        return Inertia::render('purchases/pay', [
            'order' => $order->load(['items.product.seller', 'items.product.media']),
            'clientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }

    /**
     * Midtrans Webhook Callback
     */
    public function callback(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed == $request->signature_key) {

            // --- FIX 2: Cari order berdasarkan midtrans_order_id yang baru ---
            $order = Order::where('midtrans_order_id', $request->order_id)->first();

            // Fallback (jika ada transaksi lama yang menggunakan format time() yang lama)
            if (!$order) {
                $parts = explode('-', $request->order_id);
                $realOrderId = end($parts);
                $order = Order::find($realOrderId);
            }

            if ($order) {
                $updateData = [
                    'payment_method' => $request->payment_type,
                    'transaction_id' => $request->transaction_id,
                ];

                if ($request->transaction_status == 'capture' || $request->transaction_status == 'settlement') {
                    $updateData['status'] = 'success';
                } else if (in_array($request->transaction_status, ['cancel', 'deny', 'expire'])) {
                    $updateData['status'] = 'cancelled';
                } else if ($request->transaction_status == 'pending') {
                    $updateData['status'] = 'pending';
                }

                $order->update($updateData);
            }
        }

        return response()->json(['message' => 'Callback processed']);
    }

    /**
     * Cancel the Order manually
     */
    public function cancel(Request $request, Order $order)
    {
        if ($request->user()->id !== $order->buyer_id) {
            abort(403, __('Unauthorized action.'));
        }

        if ($order->status === 'success') {
            return back()->with('error', __('Completed orders cannot be cancelled.'));
        }

        if ($order->status === 'cancelled') {
            return redirect()->route('purchases.index')->with('error', __('This order has been cancelled. Please create a new checkout from your cart.'));
        }

        // --- FIX 3: Tembak API Midtrans untuk membatalkan transaksi di Dashboard mereka ---
        if ($order->midtrans_order_id) {
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);

            try {
                \Midtrans\Transaction::cancel($order->midtrans_order_id);
            } catch (\Exception $e) {
                // Abaikan error jika transaksi di Midtrans sudah expire/tidak bisa dicancel lagi, 
                // kita tetap lanjutkan membatalkan di database lokal.
                \Illuminate\Support\Facades\Log::warning("Midtrans cancel failed for {$order->midtrans_order_id}: " . $e->getMessage());
            }
        }

        $order->update([
            'status' => 'cancelled',
            'snap_token' => null
        ]);

        return redirect()->route('purchases.index')->with('success', __('Order cancelled. You can now add the items to your cart and try again.'));
    }
}
