<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(): Response
    {
        // Fetch active products, eager load relationships, and order by newest
        $products = Product::with(['seller', 'category'])
            ->where('is_active', true)
            ->latest()
            ->get();

        // Send data directly to the React component
        return Inertia::render('products/index', [
            'products' => $products
        ]);
    }

    public function create(): Response
    {
        // Fetch all categories to populate the dropdown menu
        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        // 1. Strict Server-Side Validation
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'file' => 'required|file|max:51200', // Max file size: 50MB (51200 KB)
        ]);

        // 2. Secure File Storage
        // We store this in the 'private' local disk so unauthorized users cannot download it via a public URL.
        $filePath = $request->file('file')->store('digital_products');

        // 3. Database Insertion
        Product::create([
            'seller_id' => $request->user()->id, // Automatically assign the logged-in user as the seller
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'file_path' => $filePath,
            'is_active' => true, // Make it immediately available on the marketplace
        ]);

        // 4. Redirect mechanism
        // Send the user back to the marketplace grid to see their newly uploaded product
        return redirect()->route('products.index');
    }

    public function show(Request $request, Product $product)
    {
        $product->load(['seller', 'category']);

        // Check if the current user has a successful transaction for this product
        $hasPurchased = Transaction::where('buyer_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->where('status', 'success')
            ->exists();

        return Inertia::render('products/show', [
            'product' => $product,
            'hasPurchased' => $hasPurchased
        ]);
    }

    public function download(Request $request, Product $product)
    {
        $isOwner = $request->user()->id === $product->seller_id;
        $hasPurchased = Transaction::where('buyer_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->where('status', 'success')
            ->exists();

        // Security Layer: Deny access if they aren't the seller and haven't bought it
        if (!$isOwner && !$hasPurchased) {
            abort(403, 'Unauthorized. You must purchase this product to download it.');
        }

        if (!Storage::exists($product->file_path)) {
            abort(404, 'Digital file not found on the server.');
        }

        return Storage::download(
            $product->file_path,
            str_replace(' ', '_', $product->title) . '_' . basename($product->file_path)
        );
    }

    public function edit(Request $request, Product $product)
    {
        // Lapisan Keamanan: Jika ID pengguna saat ini bukan pemilik produk, tolak akses.
        if ($request->user()->id !== $product->seller_id) {
            abort(403, 'Unauthorized action. You do not own this product.');
        }

        $categories = Category::orderBy('name')->get();

        return Inertia::render('products/edit', [
            'product' => $product,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Product $product)
    {
        if ($request->user()->id !== $product->seller_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'file' => 'nullable|file|max:51200',
        ]);

        if ($request->hasFile('file')) {
            Storage::delete($product->file_path);
            $validated['file_path'] = $request->file('file')->store('digital_products');
        }

        $product->update($validated);

        return redirect()->route('products.show', $product->id);
    }

    public function destroy(Request $request, Product $product)
    {
        // 1. Security Layer: Verify ownership
        if ($request->user()->id !== $product->seller_id) {
            abort(403, 'Unauthorized action. You cannot delete someone else\'s product.');
        }

        // 2. Physical Cleanup: Delete the digital file from the server
        if ($product->file_path) {
            Storage::delete($product->file_path);
        }

        // 3. Database Cleanup: Remove the record
        $product->delete();

        // 4. Redirect the user back to the marketplace
        return redirect()->route('products.index');
    }

    public function mine(Request $request)
    {
        // Fetch only products belonging to the logged-in user, newest first
        $products = Product::with('category')
            ->where('seller_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('products/mine', [
            'products' => $products
        ]);
    }
}
