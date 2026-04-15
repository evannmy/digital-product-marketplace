<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\StoreController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Public Creator Storefront
Route::get('/creator/{user}', [StoreController::class, 'show'])->name('creator.store');

// OTP Verification Routes (Must be logged in, but NOT verified yet)
Route::middleware(['auth'])->group(function () {
    // This specific route name "verification.notice" is what Laravel's "verified" middleware looks for!
    Route::get('/verify-otp', function () {
        return inertia('auth/verify-otp');
    })->name('verification.notice');

    Route::post('/verify-otp', [\App\Http\Controllers\OtpController::class, 'verify'])->name('verification.verify_otp');
    Route::post('/verify-otp/resend', [\App\Http\Controllers\OtpController::class, 'resend'])->name('verification.resend_otp');
});

// 1. Storefront & Buyer Library
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::post('/products/{product}/checkout', [TransactionController::class, 'store'])->name('checkout');
    Route::get('/products/{product}/download', [ProductController::class, 'download'])->name('products.download');
    Route::get('/purchases', [TransactionController::class, 'purchases'])->name('purchases.index');
    Route::post('/products/{product}/reviews', [\App\Http\Controllers\ReviewController::class, 'store'])->name('reviews.store');

    // The Onboarding Action: Updates the role string
    Route::post('/onboarding/seller', function (Illuminate\Http\Request $request) {
        $request->user()->update(['role' => 'seller']);
        return back();
    })->name('onboarding.seller');
});

// 2. Seller Dashboard (Protected by IsSeller middleware)
Route::middleware(['auth', 'is_seller'])->group(function () {
    Route::get('/seller/products/mine', [ProductController::class, 'mine'])->name('products.mine');
    Route::get('/seller/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/seller/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/seller/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/seller/products/{product}/update', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/seller/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
