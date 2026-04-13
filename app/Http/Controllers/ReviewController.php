<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $userId = $request->user()->id;

        // 2. Security Check: Did they actually buy this?
        $hasPurchased = Transaction::where('buyer_id', $userId)
            ->where('product_id', $product->id)
            ->where('status', 'success')
            ->exists();

        if (!$hasPurchased) {
            return back()->with('error', 'You must purchase this product before reviewing it.');
        }

        // 3. Security Check: Create or Update the review (prevents spamming multiple reviews)
        Review::updateOrCreate(
            ['user_id' => $userId, 'product_id' => $product->id],
            ['rating' => $validated['rating'], 'comment' => $validated['comment']]
        );

        return back(); // Refresh the page to show the new review
    }
}
