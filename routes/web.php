<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsurePendingOtpSession;

// --- User Controllers ---
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CreatorController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ReviewController;

// --- Admin Controllers ---
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\FinancialController as AdminFinancialController;
use App\Http\Controllers\Admin\OrderManagementController as AdminOrderController;

// ==========================================
// GLOBAL / UTILITY ROUTES
// ==========================================
Route::post('/check-username', [ProfileController::class, 'checkUsername']);
Route::post('/midtrans/callback', [TransactionController::class, 'callback'])->name('midtrans.callback');

// ==========================================
// 1. PUBLIC ROUTES (Guests & Users)
// ==========================================
Route::get('/', [ProductController::class, 'index'])->middleware('not_admin')->name('home');
Route::get('/creators', [CreatorController::class, 'index'])->name('creators.index');
Route::get('/creators/@{user:username}', [CreatorController::class, 'show'])->name('creators.show');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// ==========================================
// 2. TWO-FACTOR AUTHENTICATION (OTP)
// ==========================================
Route::middleware([EnsurePendingOtpSession::class])->group(function () {
    Route::inertia('/verify-otp', 'auth/verify-otp')->name('verification.notice');
    Route::post('/verify-otp', [OtpController::class, 'verify'])->name('verification.verify_otp');
    Route::post('/verify-otp/resend', [OtpController::class, 'resend'])->name('verification.resend_otp');
});

// ==========================================
// 3. SHARED AUTHENTICATED ZONE (All Users + Admins)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings/email', [SettingsController::class, 'updateEmail'])->name('settings.email.update');
    Route::post('/settings/email/verify', [SettingsController::class, 'verifyEmailOtp'])->name('settings.email.verify');

    // Account Deletion
    Route::post('/settings/delete-otp', [SettingsController::class, 'sendDeletionOtp'])->name('settings.destroy.otp');
    Route::delete('/settings/account', [SettingsController::class, 'destroyAccount'])->name('settings.destroy');
});

// ==========================================
// 4. BUYER ZONE (Buyers Only - No Admins)
// ==========================================
Route::middleware(['auth', 'verified', 'not_admin'])->group(function () {

    Route::inertia('/dashboard', 'dashboard')->name('dashboard');

    // Cart
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('cart.index');
        Route::post('/store', [CartController::class, 'store'])->name('cart.store');
        Route::delete('/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    });

    // Checkout & Library
    Route::post('/checkout', [TransactionController::class, 'checkout'])->name('checkout.process');
    Route::post('/products/{product}/checkout', [TransactionController::class, 'directCheckout'])->name('checkout.direct');
    Route::get('/purchases', [TransactionController::class, 'index'])->name('purchases.index');
    Route::get('/products/{product}/download', [ProductController::class, 'download'])->name('products.download')->withTrashed();
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // Creator Onboarding
    Route::get('/become-a-creator', [CreatorController::class, 'create'])->name('creator.onboarding');
    Route::post('/become-a-creator', [CreatorController::class, 'store'])->name('creator.store');

    // Order Payment Flow
    Route::get('/orders/{order}/pay', [TransactionController::class, 'showPaymentPage'])->name('orders.pay');
    Route::patch('/orders/{order}/cancel', [TransactionController::class, 'cancel'])->name('orders.cancel');
});

// ==========================================
// 5. SELLER HUB (Protected Creators Only - No Admins)
// ==========================================
Route::middleware(['auth', 'verified', 'is_seller', 'not_admin'])->prefix('seller')->group(function () {

    // Product Management
    Route::get('/products/mine', [ProductController::class, 'mine'])->name('products.mine');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{product}/update', [ProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{product}/toggle', [ProductController::class, 'toggleActive'])->name('products.toggle');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Analytics & Earnings
    Route::get('/earnings', [CreatorController::class, 'earnings'])->name('creators.earnings');
    Route::post('/withdrawals', [CreatorController::class, 'requestWithdrawal'])->name('seller.withdrawals.store');
    Route::get('/orders', [CreatorController::class, 'orders'])->name('creators.orders');

    // Promotions
    Route::prefix('promotions')->group(function () {
        Route::get('/', [PromotionController::class, 'index'])->name('promotions.index');
        Route::post('/apply', [PromotionController::class, 'apply'])->name('promotions.apply');
        Route::post('/clear', [PromotionController::class, 'clear'])->name('promotions.clear');
    });
});

// ==========================================
// 6. ADMIN PANEL
// ==========================================
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Admin Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Manage Users
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{user}/toggle', [AdminUserController::class, 'toggleStatus'])->name('users.toggle');

    // Manage Products
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::patch('/products/{product}/toggle', [AdminProductController::class, 'toggleStatus'])->name('products.toggle');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

    // Manage System Settings
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [AdminSettingController::class, 'update'])->name('settings.update');

    // Financial Routes
    Route::get('/finances', [AdminFinancialController::class, 'index'])->name('finances.index');
    Route::patch('/withdrawals/{withdrawal}/approve', [AdminFinancialController::class, 'approveWithdrawal'])->name('withdrawals.approve');
    Route::patch('/withdrawals/{withdrawal}/reject', [AdminFinancialController::class, 'rejectWithdrawal'])->name('withdrawals.reject');

    // Order Verification Routes
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/approve', [AdminOrderController::class, 'approve'])->name('orders.approve');
    Route::patch('/orders/{order}/cancel', [AdminOrderController::class, 'cancel'])->name('orders.cancel');
});

require __DIR__ . '/settings.php';
