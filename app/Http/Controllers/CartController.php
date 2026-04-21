<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the contents of the user's cart.
     */
    public function index(Request $request)
    {
        // 1. Fetch user's cart, eagerly loading the items AND the product details
        $cart = Cart::with(['items.product.seller'])
            ->where('user_id', $request->user()->id)
            ->first();

        // 2. Pass cart data to Inertia for the React view
        return Inertia::render('cart/index', [
            'cart' => $cart
        ]);
    }

    /**
     * Add an item to the user's cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        // 1. Get or create the cart
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        // 2. EXPLICIT LOGIC: Check if the product already exists in THIS cart
        $alreadyInCart = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->exists();

        // 3. If it is already there, stop execution and return the Info message
        if ($alreadyInCart) {
            return back()->with('info', 'This digital product is already in your cart.');
            dd($alreadyInCart);
        }

        // 4. If it is NOT there, create it explicitly
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $request->product_id
        ]);

        // 5. Return the Success message
        return back()->with('success', 'Digital product added to cart.');
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(CartItem $cartItem)
    {
        // STRICT SECURITY: Ensure the user actually owns the item they are trying to delete!
        if ($cartItem->cart->user_id !== request()->user()->id) {
            abort(403);
        }

        $cartItem->delete();

        return redirect()->back()->with('success', 'Item removed from cart.');
    }
}
