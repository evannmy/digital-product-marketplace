<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Withdrawal; // <-- IMPORTED: Needed for the pending transfers
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $activeSellers = User::where('role', 'seller')
            ->where('is_active', true)
            ->whereHas('products', function ($query) {
                $query->where('is_active', true);
            })->count();

        // Calculate the total platform revenue from successful orders
        $platformRevenue = OrderItem::whereHas('order', function ($query) {
            $query->where('status', 'success');
        })->sum('platform_fee');

        // Fetch pending withdrawals to display on the action banner
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::count(),
                'total_products' => Product::count(),
                'active_sellers' => $activeSellers,
                'platform_revenue' => $platformRevenue,

                // --- ADDED: The exact variables React is waiting for ---
                'pending_transfers_count' => $pendingWithdrawals->count(),
                'pending_transfers_amount' => $pendingWithdrawals->sum(function ($wd) {
                    return $wd->amount - $wd->fee; // Automatically calculates the net amount!
                }),
            ]
        ]);
    }
}
