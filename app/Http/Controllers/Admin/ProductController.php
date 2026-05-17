<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        // Eager load the 'seller' relationship (assuming your Product model belongsTo User as 'seller' or 'user')
        // Change 'seller' to 'user' if that is what your relationship is named in the Product model.
        $products = Product::with('seller')->latest()->paginate(20);

        return Inertia::render('admin/products', [
            'products' => $products,
        ]);
    }

    public function toggleStatus(Product $product)
    {
        // 1. Just toggle the Admin Lock. 
        $product->is_locked = !$product->is_locked;

        // REMOVE THIS LINE ENTIRELY:
        // $product->is_active = !$product->is_locked; <-- DELETE THIS!

        $product->save();

        $status = $product->is_locked ? 'locked and hidden' : 'unlocked';
        return back()->with('success', "Product has been {$status}.");
    }

    public function destroy(Product $product)
    {
        // 1. Always delete public promotional media to save server space
        // (We keep the legacy image_path check just in case older products still have it)
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        foreach ($product->media as $mediaItem) {
            Storage::disk('public')->delete($mediaItem->file_path);
        }

        // 2. THE SMART CHECK: Have there been any sales?
        $hasSales = $product->orderItems()->exists();

        if ($hasSales) {
            // --- SCENARIO A: Product has buyers ---
            // Keep the private source file intact so past buyers can still download it.
            // Soft delete the product so it vanishes from the public marketplace.
            $product->delete();

            return back()->with('success', 'Product hidden from marketplace, but kept available in libraries for past buyers.');
        } else {
            // --- SCENARIO B: Product has 0 sales ---
            // Nobody needs this. Destroy the heavy source file to save server storage.
            if ($product->file_path) {
                Storage::delete($product->file_path);
            }

            // Permanently wipe the database row, bypassing Soft Deletes
            $product->forceDelete();

            return back()->with('success', 'Product and all associated files permanently deleted.');
        }
    }
}
