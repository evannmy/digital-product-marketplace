<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the contents of the user's cart.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $cart = Cart::with(['items.product.seller', 'items.product.media'])
            ->where('user_id', $user->id)
            ->first();

        // --- NEW: Map over items and append BOTH pending and purchased checks ---
        if ($cart) {
            $cart->items->transform(function ($item) use ($user) {
                // 1. Cek apakah ada order yang masih menggantung (Pending)
                $item->has_pending_order = \App\Models\OrderItem::where('product_id', $item->product_id)
                    ->whereHas('order', function ($query) use ($user) {
                        $query->where('buyer_id', $user->id)->where('status', 'pending');
                    })->exists();

                // 2. Cek apakah produk ini sudah pernah berhasil dibeli (Success)
                $item->has_purchased_order = \App\Models\OrderItem::where('product_id', $item->product_id)
                    ->whereHas('order', function ($query) use ($user) {
                        $query->where('buyer_id', $user->id)->where('status', 'success');
                    })->exists();

                return $item;
            });
        }

        return Inertia::render('cart/index', [
            'cart' => $cart
        ]);
    }

    /**
     * Add an item to the user's cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = $request->user()->id;
        $productId = $request->product_id;

        // --- PREVENTIVE UX CHECKS ---

        $product = Product::findOrFail($productId);

        // 1. Prevent buying their own product
        if ($product->seller_id === $userId) {
            return back()->with('error', __('You cannot add your own product to the cart.'));
        }

        // 2. Prevent adding if already owned or currently pending checkout
        $hasOrdered = OrderItem::whereHas('order', function ($query) use ($userId) {
            $query->where('buyer_id', $userId)->whereIn('status', ['success', 'pending']);
        })->where('product_id', $productId)->exists();

        if ($hasOrdered) {
            return back()->with('error', __('You already have a pending order for this product. Please complete or cancel it first.'));
        }

        // --- STANDARD CART LOGIC ---

        // 3. Get or create the cart
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // 4. EXPLICIT LOGIC: Check if the product already exists in THIS cart
        $alreadyInCart = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->exists();

        // 5. If it is already there, stop execution and return the Info message
        if ($alreadyInCart) {
            return back()->with('info', __('This digital product is already in your cart.'));
        }

        // 6. If it is NOT there, create it explicitly
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $productId
        ]);

        // 7. Return the Success message
        return back()->with('success', __('Product added to cart!'));
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(CartItem $cartItem)
    {
        // STRICT SECURITY: Ensure the user actually owns the item they are trying to delete!
        if ($cartItem->cart->user_id !== request()->user()->id) {
            abort(403);
        }

        $cartItem->delete();

        return redirect()->back()->with('success', __('Product removed from cart.'));
    }
}
