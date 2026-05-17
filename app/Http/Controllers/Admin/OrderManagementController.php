<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        // --- 1. THE FIX: Force Laravel to load soft-deleted products ---
        $query = Order::with([
            'buyer',
            'items.product' => function ($q) {
                // Load the product even if it is in the trash, and include the seller
                $q->withTrashed()->with('seller');
            }
        ])->latest();

        // 1. Search Logic (Search by Order ID, Buyer Name, or Email)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('buyer', function ($buyerQuery) use ($search) {
                        $buyerQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // 2. Status Filter Logic
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 3. Calculate Real-Time Stats
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'completed' => Order::where('status', 'success')->count(),
        ];

        return Inertia::render('admin/orders', [
            'orders' => $query->paginate(15)->withQueryString(),
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function cancel(Order $order)
    {
        // Guardrail
        if ($order->status === 'success') {
            return back()->with('error', 'Cannot cancel a completed order.');
        }

        // --- 2. THE FIX: Removed the Midtrans ping to speed up the Admin panel ---
        // (Because the local snap_token is wiped, the user can immediately re-checkout. 
        // The old invoice on Midtrans will simply expire quietly on its own).

        $order->update([
            'status' => 'cancelled',
            'snap_token' => null
        ]);

        return back()->with('success', 'Order forcefully cancelled.');
    }
}
