<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// 1. Storefront
Route::get('/products', [ProductController::class, 'index'])->middleware(['auth'])->name('products.index');

// 2. Seller Dashboard (Must be above dynamic parameters)
Route::get('/products/mine', [ProductController::class, 'mine'])->middleware(['auth'])->name('products.mine');

// 3. Create & Store
Route::get('/products/create', [ProductController::class, 'create'])->middleware(['auth'])->name('products.create');
Route::post('/products', [ProductController::class, 'store'])->middleware(['auth'])->name('products.store');

// 4. Show, Edit, Update, Delete
Route::get('/products/{product}', [ProductController::class, 'show'])->middleware(['auth'])->name('products.show');
Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->middleware(['auth'])->name('products.edit');
Route::post('/products/{product}/update', [ProductController::class, 'update'])->middleware(['auth'])->name('products.update');
Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware(['auth'])->name('products.destroy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
