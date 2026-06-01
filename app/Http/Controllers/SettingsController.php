<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // <-- ADDED: Crucial for the unique email check
use Illuminate\Support\Facades\Cache; // <-- ADD THIS
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter; // <-- Needed for spam protection
use Illuminate\Support\Facades\Auth;
use App\Mail\AccountDeletionOtp;
use App\Mail\AccountDeleted;
use App\Mail\EmailChangeOtp;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Display the user's secure settings page.
     */
    public function index(Request $request)
    {
        return Inertia::render('settings/index', [
            // Standard Breeze props
            'mustVerifyEmail' => $request->user() instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'status' => session('status'),

            // Explicitly pass our custom flash data to React!
            'flash' => [
                'require_otp' => session('require_otp'),
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Send a password reset link to the authenticated user.
     */
    public function sendResetLink(Request $request)
    {
        $user = $request->user();

        // Use the fully qualified Facade to prevent import collisions.
        // This handles generating the token and sending the notification automatically!
        $status = \Illuminate\Support\Facades\Password::broker()->sendResetLink(
            ['email' => $user->email]
        );

        // Check if Laravel successfully fired the email
        if ($status === \Illuminate\Support\Facades\Password::RESET_LINK_SENT) {
            return back()->with('success', __('A secure password reset link has been sent to your email!'));
        }

        // Fallback error if something goes wrong (e.g., mail server issues)
        return back()->with('error', __('Unable to send reset link. Please try again later.'));
    }

    /**
     * Trigger an OTP for a newly requested email address.
     */
    public function updateEmail(Request $request)
    {
        $user = $request->user();

        // --- 1. THE RATE LIMITER ---
        // Create a unique key for this user
        $rateLimitKey = 'email_change_attempts_' . $user->id;

        // Check if they have made 3 attempts already
        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            // Calculate how many minutes they have to wait
            $seconds = RateLimiter::availableIn($rateLimitKey);
            $minutes = ceil($seconds / 60);

            // Redirect back with a beautiful error message!
            return redirect()->route('settings.index')->with(
                'error',
                __('Too many attempts. Please try again in :minutes minutes.', ['minutes' => $minutes])
            );
        }

        // --- 2. VALIDATION ---
        $request->validate([
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
        ]);

        if ($request->email === $user->email) {
            return redirect()->route('settings.index')->with('success', __('Email settings updated.'));
        }

        // --- 3. RECORD THE ATTEMPT ---
        // Because they passed validation and we are about to send an email,
        // we hit the rate limiter! (600 seconds = 10 minutes)
        RateLimiter::hit($rateLimitKey, 600);

        // --- 4. SEND THE EMAIL ---
        $otp = rand(100000, 999999);

        Cache::put('pending_email_' . $user->id, [
            'otp' => $otp,
            'new_email' => $request->email
        ], now()->addMinutes(10));

        Mail::to($request->email)->send(new EmailChangeOtp($otp));

        return redirect()->route('settings.index')->with([
            'require_otp' => true,
            'success' => __('OTP sent to your new email!')
        ]);
    }

    /**
     * Verify the OTP and finally change the email in the database.
     */
    public function verifyEmailOtp(Request $request)
    {
        $request->validate([
            'otp' => ['required', 'numeric', 'digits:6'],
        ]);

        $user = $request->user();

        // 1. Retrieve the pending data from the Cache
        $pendingData = Cache::get('pending_email_' . $user->id);

        // 2. Check if the OTP matches and hasn't expired
        if (!$pendingData || (string) $request->otp !== (string) $pendingData['otp']) {
            return redirect()->route('settings.index')->withErrors(['otp' => __('Invalid or expired verification code.')]);
        }

        // 3. Success! NOW we update the database because they proved ownership.
        $user->email = $pendingData['new_email'];
        $user->email_verified_at = now();
        $user->save();

        // 4. Clear the Cache so it can't be reused
        Cache::forget('pending_email_' . $user->id);

        return redirect()->route('settings.index')->with('success', __('Email successfully verified and updated!'));
    }

    /**
     * Trigger the OTP for account deletion.
     */
    public function sendDeletionOtp(Request $request)
    {
        $user = $request->user();
        $rateLimitKey = 'account_deletion_attempts_' . $user->id;

        // Manual Rate Limiting (Protects from spam)
        if (RateLimiter::tooManyAttempts($rateLimitKey, 3)) {
            $minutes = ceil(RateLimiter::availableIn($rateLimitKey) / 60);
            return back()->with('error', __('Too many attempts. Please try again in :minutes minutes.', ['minutes' => $minutes]));
        }

        RateLimiter::hit($rateLimitKey, 600);

        // Generate and Cache OTP
        $otp = rand(100000, 999999);
        Cache::put('deletion_otp_' . $user->id, $otp, now()->addMinutes(10));

        // Send Email
        Mail::to($user->email)->send(new AccountDeletionOtp($otp));

        return back()->with([
            'require_delete_otp' => true,
            'success' => __('Security code sent to your email.')
        ]);
    }

    /**
     * Delete the user's account using the OTP.
     */
    public function destroyAccount(Request $request)
    {
        $request->validate([
            'otp' => ['required', 'numeric', 'digits:6'],
        ]);

        $user = $request->user();
        $expectedOtp = Cache::get('deletion_otp_' . $user->id);

        if (!$expectedOtp || (string) $request->otp !== (string) $expectedOtp) {
            return back()->withErrors(['otp' => __('Invalid or expired verification code.')]);
        }

        // 1. OTP is correct! Clear cache
        Cache::forget('deletion_otp_' . $user->id);

        // 2. CAPTURE DETAILS AND SEND FAREWELL EMAIL
        $userEmail = $user->email;
        $userName = $user->name;
        Mail::to($userEmail)->send(new AccountDeleted($userName));

        // 3. PHYSICAL FILE CLEANUP

        // A. Delete Profile Images (Public Disk)
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }
        if ($user->cover_photo_path) {
            Storage::disk('public')->delete($user->cover_photo_path);
        }

        // B. Smart Cleanup for Products & Media Galleries
        $user->load('products.media');

        foreach ($user->products as $product) {
            // Always delete the public media gallery (images & videos) to save space
            foreach ($product->media as $mediaItem) {
                Storage::disk('public')->delete($mediaItem->file_path);
            }

            // THE SMART CHECK: Have there been any sales?
            $hasSales = $product->orderItems()->exists();

            if ($hasSales) {
                // --- SCENARIO A: Product has buyers ---
                // Keep the source file intact for past buyers.
                // Soft delete the product so it vanishes from the marketplace.
                $product->delete();
            } else {
                // --- SCENARIO B: Product has 0 sales ---
                // Nobody needs this. Destroy the heavy source file to save storage.
                if ($product->file_path) {
                    Storage::delete($product->file_path);
                }

                // Permanently wipe the database row, bypassing Soft Deletes
                $product->forceDelete();
            }
        }

        // 4. Log them out and permanently delete their user record
        Auth::logout();
        $user->delete();

        // 5. Destroy their active session for complete security
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', __('Your account has been successfully deleted. We are sorry to see you go!'));
    }
}
