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

    public function show(Product $product): Response
    {
        // Eager load the relationships for this specific product
        $product->load(['seller', 'category']);

        return Inertia::render('products/show', [
            'product' => $product
        ]);
    }
}
