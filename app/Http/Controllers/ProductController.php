<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

    public function show(Product $product): Response
    {
        // Eager load the relationships for this specific product
        $product->load(['seller', 'category']);

        return Inertia::render('products/show', [
            'product' => $product
        ]);
    }
}
