<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
}
