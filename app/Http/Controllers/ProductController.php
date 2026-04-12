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
        // 1. Update validation to include the image
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'file' => 'required|file|max:51200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB Image
        ]);

        // 2. Handle the Image Upload (Public Disk)
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('product_images', 'public');
        }

        // 3. Handle the Digital File (Private Disk - stays exactly the same)
        $filePath = $request->file('file')->store('digital_products');

        // 4. Update the database insertion
        Product::create([
            'seller_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'file_path' => $filePath,
            'image_path' => $imagePath, // Save the image location
            'is_active' => true,
        ]);

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
        // 1. Security Layer: Verify ownership
        if ($request->user()->id !== $product->seller_id) {
            abort(403, 'Unauthorized action.');
        }

        // 2. Validation (Now includes the image rules)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'file' => 'nullable|file|max:51200',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
        ]);

        // 3. Handle Digital File Replacement (Private Disk)
        if ($request->hasFile('file')) {
            Storage::delete($product->file_path);
            $validated['file_path'] = $request->file('file')->store('digital_products');
        }

        // 4. Handle Cover Image Replacement (Public Disk)
        if ($request->hasFile('image')) {
            // If the product already had an image, delete it from the public folder first
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            // Store the new image
            $validated['image_path'] = $request->file('image')->store('product_images', 'public');
        }

        // 5. Save updates to MySQL
        $product->update($validated);

        // 6. Return the seller to their product page
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
