<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->back()->with('error', 'Your cart is empty.');
        }

        DB::beginTransaction();

        try {
            foreach ($cart->items as $item) {
                $product = $item->product;

                // SECURITY 1: Is product active?
                if (!$product || !$product->is_active) {
                    throw new \Exception("Product '{$product->title}' is unavailable.");
                }

                // SECURITY 2: Did they try to buy their own product?
                if ($user->id === $product->seller_id) {
                    throw new \Exception("You cannot purchase your own product: '{$product->title}'.");
                }

                // SECURITY 3: Do they already own it?
                $alreadyBought = Transaction::where('buyer_id', $user->id)
                    ->where('product_id', $product->id)
                    ->where('status', 'success')
                    ->exists();

                if ($alreadyBought) {
                    throw new \Exception("You already own '{$product->title}'.");
                }

                // Create the permanent transaction record
                Transaction::create([
                    'buyer_id' => $user->id,
                    'product_id' => $product->id,
                    'price' => $product->price, // Notice we use 'price', adjust if your DB uses 'amount'
                    'status' => 'success',
                ]);
            }

            // Destroy the cart after successful checkout
            $cart->delete();
            DB::commit();

            return redirect()->route('purchases.index')->with('success', 'Checkout successful! You can now download your products.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('cart.index')->with('error', 'Checkout failed: ' . $e->getMessage());
        }
    }

    /**
     * Handles the "Buy It Now" button directly from the Product Detail Page.
     */
    public function directCheckout(Request $request, Product $product)
    {
        $user = $request->user();

        // SECURITY 1 & 2
        if ($user->id === $product->seller_id) {
            return back()->with('error', 'You cannot purchase your own product.');
        }

        $alreadyBought = Transaction::where('buyer_id', $user->id)
            ->where('product_id', $product->id)
            ->where('status', 'success')
            ->exists();

        if ($alreadyBought) {
            return back()->with('error', 'You already own this product.');
        }

        // Process Direct Checkout
        Transaction::create([
            'buyer_id' => $user->id,
            'product_id' => $product->id,
            'price' => $product->price,
            'status' => 'success',
        ]);

        return back()->with('success', "You successfully purchased {$product->title}!");
    }

    public function purchases(Request $request)
    {
        // Fetch successful transactions for the logged-in buyer
        $transactions = Transaction::with(['product.category', 'product.seller'])
            ->where('buyer_id', $request->user()->id)
            ->where('status', 'success')
            ->latest()
            ->get();

        return inertia('purchases/index', [
            'transactions' => $transactions
        ]);
    }
}
