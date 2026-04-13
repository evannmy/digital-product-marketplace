<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function show(User $user)
    {
        // 1. Security: Ensure the requested user is actually a seller
        if ($user->role !== 'seller') {
            abort(404, 'Creator not found.');
        }

        // 2. Fetch only the active products belonging to this specific seller
        $products = Product::with('category')
            ->where('seller_id', $user->id)
            ->where('is_active', true)
            ->latest()
            ->get();

        // 3. Return the public profile view
        return Inertia::render('store/show', [
            'creator' => $user,
            'products' => $products
        ]);
    }
}
