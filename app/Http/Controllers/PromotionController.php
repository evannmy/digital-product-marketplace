<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use Carbon\Carbon;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        // Get all products owned by the logged-in seller
        $products = Product::where('seller_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('promotions/index', [
            'products' => $products
        ]);
    }

    public function apply(Request $request)
    {
        // 1. Strict Validation
        $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
            'discount_percentage' => 'required|numeric|min:1|max:99',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'timezone' => 'required|string|timezone',
        ]);

        // 2. Fetch products
        $products = Product::whereIn('id', $request->product_ids)
            ->where('seller_id', $request->user()->id)
            ->get();

        // 3. Apply the discount
        foreach ($products as $product) {
            $multiplier = 1 - ($request->discount_percentage / 100);
            $newDiscountPrice = $product->price * $multiplier;

            $product->update([
                'discount_price' => $newDiscountPrice,
                // Carbon safely formats the HTML string into a MySQL timestamp
                'discount_starts_at' => Carbon::parse($request->starts_at, $request->timezone)->utc(),
                'discount_ends_at' => Carbon::parse($request->ends_at, $request->timezone)->utc(),
            ]);
        }

        return redirect()->back()->with('success', __('Flash sale successfully applied to selected products!'));
    }

    public function clear(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
        ]);

        // Hitung berapa banyak produk yang sebenarnya dimiliki seller ini dari array yang dikirim
        $clearedCount = Product::whereIn('id', $request->product_ids)
            ->where('seller_id', $request->user()->id)
            ->update([
                'discount_price' => null,
                'discount_starts_at' => null,
                'discount_ends_at' => null,
            ]);

        // --- DIBUNGKUS DENGAN __() MENGGUNAKAN PLACEHOLDER ---
        return redirect()->back()->with(
            'success',
            __('Discounts cleared from :count product(s).', ['count' => $clearedCount])
        );
    }
}
