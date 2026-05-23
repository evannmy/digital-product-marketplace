<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class OtpController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $email = $request->session()->get('pending_otp_email');

        if (!$email) {
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        // 1. RATE LIMITING: Create a unique "key" for this email's attempts
        $throttleKey = 'verify-otp:' . $email;

        // If they have failed 5 times, block them completely
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->with('error', "Too many attempts. Please try again in {$seconds} seconds.");
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'User not found.');
        }

        // 2. Security Check: Has the time expired?
        if (now()->isAfter($user->otp_expires_at)) {
            return back()->with('error', 'Your verification code has expired. Please request a new one.');
        }

        // 3. Logic Check: Does the code match? (Cast both to string to prevent strict-type bugs)
        if ((string) $user->otp_code === (string) $request->code) {

            // Success! Mark as verified
            $user->markEmailAsVerified();

            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null,
                'otp_verified_at' => now(),
            ]);

            Auth::login($user);

            // Clean up the session AND the rate limiter history
            $request->session()->forget('pending_otp_email');
            RateLimiter::clear($throttleKey);

            return redirect()->route('home')->with('success', 'Email verified successfully! Welcome to Soko.');
        }

        // 4. RATE LIMITING: Record a failed attempt!
        // This locks them out for 5 minutes (300 seconds) if they hit 5 fails.
        RateLimiter::hit($throttleKey, 300);

        return back()->with('error', 'Invalid verification code. Please try again.');
    }

    public function resend(Request $request)
    {
        // 1. Get the email from our temporary session ticket instead of Auth
        $email = $request->session()->get('pending_otp_email');

        if (!$email) {
            return redirect()->route('login')->with('error', 'Session expired. Please log in again.');
        }

        // 2. Find the user in the database
        $user = User::where('email', $email)->first();

        if (!$user) {
            return redirect()->route('login')->with('error', 'User not found.');
        }

        // 3. Generate a fresh code
        $newCode = random_int(100000, 999999);

        // 4. Update the database and reset the 10-minute clock
        $user->update([
            'otp_code' => $newCode,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        // 5. Send the new email (Make sure your Mail facade and Mailable are imported at the top!)
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OtpVerificationMail($newCode));

        return back()->with('success', 'A new 6-digit code has been sent to your email.');
    }

    public function updateEmail(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        ]);

        // 1. Cari siapa pengguna yang sedang mencoba mengubah email
        $oldEmail = session('pending_otp_email');
        $user = \App\Models\User::where('email', $oldEmail)->first();

        if (!$user) {
            return back()->with('error', 'Session expired. Please register again.');
        }

        // 2. Update email dan generate OTP baru
        $user->email = $request->email;
        $user->otp_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        // 3. Update juga session ticket dengan email yang baru!
        $request->session()->put('pending_otp_email', $user->email);

        // 4. Kirim ulang email
        $user->sendEmailVerificationNotification();

        return back()->with('success', 'Email has been updated and a new OTP sent.');
    }

    public function show()
    {
        // Ambil email dari session ticket yang dibuat oleh FortifyServiceProvider
        $email = session('pending_otp_email');

        // Kirim email tersebut ke React
        return inertia('auth/verify-otp', [
            'pendingEmail' => $email
        ]);
    }
}
