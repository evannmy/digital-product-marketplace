<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function store(Request $request, Product $product)
    {
        // 1. Prevent sellers from buying their own products
        if ($request->user()->id === $product->seller_id) {
            abort(403, 'You cannot purchase your own product.');
        }

        // 2. Prevent duplicate purchases
        $alreadyBought = Transaction::where('buyer_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->where('status', 'success')
            ->exists();

        if ($alreadyBought) {
            return back()->with('error', 'You already own this product.');
        }

        // 3. Record the transaction
        Transaction::create([
            'buyer_id' => $request->user()->id,
            'product_id' => $product->id,
            'amount' => $product->price,
            'status' => 'success', // Simulating a successful payment
        ]);

        return back();
    }

    public function purchases(Request $request)
    {
        // Fetch successful transactions for the logged-in buyer
        $transactions = Transaction::with(['product.category', 'product.seller'])
            ->where('buyer_id', $request->user()->id)
            ->where('status', 'success')
            ->latest()
            ->get();

        return inertia('purchases/index', [
            'transactions' => $transactions
        ]);
    }
}
