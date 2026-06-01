<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Withdrawal;
use App\Models\WithdrawalMethod;
use App\Models\Setting; // <-- ADDED: Imported for Onboarding settings
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

class CreatorController extends Controller
{
    /**
     * 1. Public Creators Listing (Index)
     */
    public function index(Request $request)
    {
        $query = User::where('is_active', true)
            ->whereHas('products', function ($q) {
                $q->where('is_active', true);
            })
            ->withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }])
            ->withAvg('receivedReviews', 'rating');

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('name', 'like', $searchTerm);
        }

        $sort = $request->input('sort', 'products_desc');

        match ($sort) {
            'newest'        => $query->latest(),
            'name_asc'      => $query->orderBy('name', 'asc'),
            'rating_desc'   => $query->orderByDesc('received_reviews_avg_rating'),
            'products_desc' => $query->orderByDesc('products_count'),
            default         => $query->orderByDesc('products_count'),
        };

        $creators = $query->paginate(12)->withQueryString();

        return Inertia::render('creators/index', [
            'creators' => $creators,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort
            ],
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * 2. Public Creator Profile (Show)
     */
    public function show(Request $request, User $user)
    {
        $viewer = $request->user();
        $isAdmin = $viewer && $viewer->role === 'admin';

        if (! $isAdmin) {
            abort_if(! $user->is_active, 404);
        }

        $user->loadCount(['products' => function ($query) {
            $query->where('is_active', true);
        }])->loadAvg('receivedReviews', 'rating');

        $products = $user->products()
            ->where('is_active', true)
            ->with(['category', 'seller', 'media'])
            ->withAvg('reviews', 'rating')
            ->latest()
            ->paginate(12);

        return Inertia::render('creators/show', [
            'creator' => $user,
            'products' => $products,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'auth' => [
                'user' => $viewer,
            ],
        ]);
    }

    // =========================================================================
    // --- 3. SELLER ONBOARDING (Merged from CreatorOnboardingController) ---
    // =========================================================================

    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // If they are already a seller, send them straight to their dashboard
        if ($user && $user->role === 'seller') {
            return redirect()->route('products.mine');
        }

        // Fetch settings as a key-value array for the frontend
        $settings = Setting::whereIn('key', [
            'platform_fee_percentage',
            'withdrawal_minimum',
            'withdrawal_free_threshold'
        ])->pluck('value', 'key')->toArray();

        // Pass the settings to the React component
        return inertia('creators/onboarding', [
            'settings' => $settings
        ]);
    }

    public function store()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Upgrade the user to a seller
        $user->update(['role' => 'seller']);

        // Redirect with a success toast notification
        return redirect()->route('products.mine')->with('success', __('Welcome to the Creator Hub!'));
    }

    // =========================================================================
    // --- 4. SELLER HUB & ANALYTICS ---
    // =========================================================================

    /**
     * Seller Hub: Detailed Earnings Page
     */
    public function earnings(Request $request)
    {
        $userId = \Illuminate\Support\Facades\Auth::id();

        // --- 1. CALCULATE TOP STATS ---
        $successItems = \App\Models\OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'success');
            });

        $grossRevenue = (clone $successItems)->sum('price');
        $platformFees = (clone $successItems)->sum('platform_fee');
        $netRevenue   = (clone $successItems)->sum('seller_earnings');

        $pendingClearance = \App\Models\OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'pending');
            })->sum('seller_earnings');

        $totalWithdrawnOrPending = \App\Models\Withdrawal::where('seller_id', $userId)
            ->whereIn('status', ['pending', 'completed'])
            ->sum('amount');

        $availablePayout = $netRevenue - $totalWithdrawnOrPending;

        // --- 2. FETCH RECENT SALES DETAILS ---
        $recentSales = (clone $successItems)
            ->with('product')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => 'ITM-' . $item->id,
                    'title' => $item->product ? $item->product->title : __('Archived Product'),
                    'date' => $item->created_at->format('M j, Y'),
                    'gross' => $item->price,
                    'fee' => $item->platform_fee,
                    'net' => $item->seller_earnings,
                ];
            });

        // --- 3. FETCH WITHDRAWAL HISTORY ---
        $withdrawals = \App\Models\Withdrawal::where('seller_id', $userId)
            ->latest()
            ->take(15)
            ->get()
            ->map(function ($wd) {
                return [
                    'id' => $wd->id,
                    'amount' => (float) $wd->amount,
                    'fee' => (float) $wd->fee,
                    'net_amount' => (float) ($wd->amount - $wd->fee),
                    'status' => $wd->status,
                    'bank_name' => $wd->bank_name,
                    'account_number' => $wd->account_number,
                    'created_at' => $wd->created_at,
                ];
            });

        $withdrawalMethods = \App\Models\WithdrawalMethod::where('is_active', true)->get();

        return inertia('creators/earnings', [
            'stats' => [
                'grossRevenue' => $grossRevenue,
                'platformFees' => $platformFees,
                'availablePayout' => $availablePayout,
                'pendingClearance' => $pendingClearance,
            ],
            'recentSales' => $recentSales,
            'withdrawals' => $withdrawals,
            'withdrawalMethods' => $withdrawalMethods,
        ]);
    }

    /**
     * Handle the POST request from the withdrawal modal
     */
    public function requestWithdrawal(Request $request)
    {
        $userId = \Illuminate\Support\Facades\Auth::id();

        // 1. SECURITY CHECK: Prevent multiple pending requests
        $hasPending = \App\Models\Withdrawal::where('seller_id', $userId)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        if ($hasPending) {
            return back()->withErrors([
                'amount' => __('You already have a pending withdrawal. Please wait for it to be processed before requesting another.')
            ]);
        }

        // 2. Validate Form Input
        $validated = $request->validate([
            'amount' => 'required|numeric|min:20000',
            'method_id' => 'required|exists:withdrawal_methods,id',
            'account_number' => 'required|string|max:255',
        ]);

        // 3. Server-Side Balance Check (Now perfectly matching the GET route!)
        // We query OrderItem directly by seller_id so deleted products are safely included.
        $totalNetRevenue = \App\Models\OrderItem::where('seller_id', $userId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'success');
            })->sum('seller_earnings');

        $totalWithdrawnOrPending = \App\Models\Withdrawal::where('seller_id', $userId)
            ->whereIn('status', ['pending', 'completed'])
            ->sum('amount');

        $realAvailableBalance = $totalNetRevenue - $totalWithdrawnOrPending;

        if ($validated['amount'] > $realAvailableBalance) {
            return back()->withErrors(['amount' => __('Insufficient funds available for this withdrawal.')]);
        }

        // 4. Calculate the Bank Transfer Fee dynamically
        $method = \App\Models\WithdrawalMethod::find($validated['method_id']);

        // Apply the "Free over 500k" rule, otherwise use the specific method's fee
        $calculatedFee = $validated['amount'] >= 500000 ? 0 : $method->fee;

        // 5. Save to Database
        \App\Models\Withdrawal::create([
            'seller_id' => $userId,
            'amount' => $validated['amount'],
            'fee' => $calculatedFee,
            'bank_name' => $method->name, // Snapshot the name so history isn't broken if you change it later
            'account_number' => $validated['account_number'],
            'status' => 'pending',
        ]);

        return back()->with('success', __('Withdrawal request submitted successfully!'));
    }

    // =========================================================================
    // --- 5. SELLER HUB: ORDERS ---
    // =========================================================================

    public function orders(Request $request)
    {
        $userId = Auth::id();

        // 1. Force the main query to include orders for soft-deleted products
        $paginatedOrders = Order::whereHas('items.product', function ($query) use ($userId) {
            $query->withTrashed()->where('seller_id', $userId);
        })
            ->where('status', 'success')
            ->with(['buyer', 'items' => function ($q) use ($userId) {
                // 2. Force the items filter to include soft-deleted products
                $q->whereHas('product', function ($pq) use ($userId) {
                    $pq->withTrashed()->where('seller_id', $userId);
                })
                    // 3. Force Eloquent to actually LOAD the soft-deleted product data
                    ->with(['product' => function ($productQuery) {
                        $productQuery->withTrashed()->with('category');
                    }]);
            }])
            ->latest()
            ->paginate(15);

        $paginatedOrders->through(function ($order) {
            $sellerGross = $order->items->sum('price');
            $sellerNet = $order->items->sum('seller_earnings');

            $productPreview = $order->items->map(function ($item) {
                return $item->product ? $item->product->title : __('Archived Product');
            })->implode(', ');

            return [
                'id' => 'ORD-' . $order->id,
                'buyer' => ($order->buyer) ? $order->buyer->name : __('Deleted User'),
                'buyer_username' => ($order->buyer) ? $order->buyer->username : null,

                'amount' => $sellerGross,
                'net_amount' => $sellerNet,
                'date' => $order->created_at->format('M j, Y'),
                'productPreview' => $productPreview,

                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => 'ITM-' . $item->id,
                        'title' => $item->product ? $item->product->title : __('Archived Product'),
                        'price' => $item->price,
                        'net_price' => $item->seller_earnings,
                        'is_archived' => $item->product ? $item->product->trashed() : true,
                    ];
                })
            ];
        });

        return Inertia::render('creators/orders', [
            'orders' => $paginatedOrders
        ]);
    }
}
