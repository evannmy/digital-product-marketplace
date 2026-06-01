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
        $product->save();

        // --- PISAHKAN PESAN AGAR MUDAH DITERJEMAHKAN ---
        if ($product->is_locked) {
            return back()->with('success', __('Product has been locked and hidden.'));
        } else {
            return back()->with('success', __('Product has been unlocked.'));
        }
    }

    public function destroy(Product $product)
    {
        // 1. Always delete public promotional media to save server space
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        foreach ($product->media as $mediaItem) {
            Storage::disk('public')->delete($mediaItem->file_path);
        }

        // 2. THE SMART CHECK: Have there been any sales?
        $hasSales = $product->orderItems()->exists();

        if ($hasSales) {
            $product->delete();
            // --- DIBUNGKUS DENGAN __() ---
            return back()->with('success', __('Product hidden from marketplace, but kept available in libraries for past buyers.'));
        } else {
            if ($product->file_path) {
                Storage::delete($product->file_path);
            }
            $product->forceDelete();
            // --- DIBUNGKUS DENGAN __() ---
            return back()->with('success', __('Product and all associated files permanently deleted.'));
        }
    }
}
