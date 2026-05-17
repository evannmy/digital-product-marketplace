<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController; // Old Breeze controller (used for deletion)
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;

// We REMOVED the old 'settings' redirect and 'settings/profile' routes 
// because your web.php is now handling them with your custom Soko controllers!

Route::middleware(['auth', 'verified'])->group(function () {

    // 1. Account Deletion (Kept so your Danger Zone button works)
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 2. Password Updates
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update'); // <--- CHANGED BACK TO THIS

    Route::post('settings/password/email', [\App\Http\Controllers\SettingsController::class, 'sendResetLink'])
        ->middleware('throttle:3,1') // Protects against spamming the email button!
        ->name('password.email-logged-in');

    // 3. Other Breeze Defaults (Safe to keep if you plan to use them later)
    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])->name('two-factor.show');
});
