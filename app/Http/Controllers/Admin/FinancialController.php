<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinancialController extends Controller
{
    public function index()
    {
        // 1. Calculate Platform Earnings
        $totalPlatformRevenue = OrderItem::whereHas('order', function ($query) {
            $query->where('status', 'success');
        })->sum('platform_fee');

        $totalSalesVolume = OrderItem::whereHas('order', function ($query) {
            $query->where('status', 'success');
        })->sum('price');

        // --- FIXED: Calculate Pending Net Transfers correctly (Amount - Fee) ---
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->get();
        $pendingPayoutsAmount = $pendingWithdrawals->sum(function ($wd) {
            return $wd->amount - $wd->fee;
        });
        $pendingPayoutsCount = $pendingWithdrawals->count();

        // 3. Fetch Withdrawal Requests
        $withdrawals = Withdrawal::with('seller')
            ->latest()
            ->paginate(15)
            ->through(function ($wd) {
                return [
                    'id' => $wd->id,
                    'ref_id' => 'WD-' . $wd->id,
                    'seller_name' => $wd->seller->name ?? 'Unknown',

                    // --- ADDED: Pass the username to the frontend ---
                    'seller_username' => $wd->seller->username ?? null,

                    'seller_email' => $wd->seller->email ?? 'Unknown',
                    'gross_amount' => (float) $wd->amount,
                    'fee' => (float) $wd->fee,
                    'net_amount' => (float) ($wd->amount - $wd->fee),
                    'status' => $wd->status,
                    'bank_details' => $wd->bank_name . ' - ' . $wd->account_number,
                    'date' => $wd->created_at->format('M j, Y'),
                ];
            });

        return Inertia::render('admin/finances', [
            'stats' => [
                'totalPlatformRevenue' => $totalPlatformRevenue,
                'totalSalesVolume' => $totalSalesVolume,
                'pendingPayoutsAmount' => $pendingPayoutsAmount,
                'pendingPayoutsCount' => $pendingPayoutsCount,
            ],
            'withdrawals' => $withdrawals,
        ]);
    }

    public function approveWithdrawal(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending withdrawals can be approved.');
        }
        $withdrawal->update(['status' => 'completed']);
        return back()->with('success', 'Withdrawal marked as completed! The seller has been notified.');
    }

    public function rejectWithdrawal(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending withdrawals can be rejected.');
        }
        $withdrawal->update(['status' => 'failed']);
        return back()->with('success', 'Withdrawal rejected. The funds have been returned to the seller\'s balance.');
    }
}
