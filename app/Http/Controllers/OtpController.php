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
    public function show(Request $request)
    {
        // 1. Ambil email dari session ticket
        $email = $request->session()->get('pending_otp_email');

        if (!$email) {
            return redirect()->route('login');
        }

        // 2. Cari user di database
        $user = User::where('email', $email)->first();

        // 3. SECURITY CHECK: Jika user dihapus oleh admin
        if (!$user) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('register')->with('error', __('Account no longer exists. Please register again.'));
        }

        // 4. SECURITY CHECK: Jika user sudah diverifikasi secara manual oleh admin
        if ($user->email_verified_at !== null) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('success', __('Your account has been verified by the administrator. Please log in.'));
        }

        // Kirim email tersebut ke React jika lolos semua pengecekan
        return inertia('auth/verify-otp', [
            'pendingEmail' => $email
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $email = $request->session()->get('pending_otp_email');

        if (!$email) {
            return redirect()->route('login')->with('error', __('Session expired. Please log in again.'));
        }

        // 1. RATE LIMITING
        $throttleKey = 'verify-otp:' . $email;
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->with('error', __('Too many attempts. Please try again in :seconds seconds.', ['seconds' => $seconds]));
        }

        $user = User::where('email', $email)->first();

        // SECURITY CHECK: Jika user dihapus saat sedang mencoba memverifikasi
        if (!$user) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('error', __('User not found or has been deleted.'));
        }

        // SECURITY CHECK: Jika user sudah diverifikasi
        if ($user->email_verified_at !== null) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('success', __('Your account is already verified. Please log in.'));
        }

        // 2. Security Check: Has the time expired?
        if (now()->isAfter($user->otp_expires_at)) {
            return back()->with('error', __('Your verification code has expired. Please request a new one.'));
        }

        // 3. Logic Check: Does the code match?
        if ((string) $user->otp_code === (string) $request->code) {
            $user->markEmailAsVerified();

            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null,
                'otp_verified_at' => now(), // Opsional: pastikan kolom ini ada di database/fillable jika Anda menggunakannya
            ]);

            Auth::login($user);

            // Clean up the session AND the rate limiter history
            $request->session()->forget('pending_otp_email');
            RateLimiter::clear($throttleKey);

            return redirect()->route('home')->with('success', __('Email verified successfully! Welcome to Soko.'));
        }

        // 4. RATE LIMITING: Record a failed attempt
        RateLimiter::hit($throttleKey, 300);

        return back()->with('error', __('Invalid verification code. Please try again.'));
    }

    public function resend(Request $request)
    {
        $email = $request->session()->get('pending_otp_email');

        if (!$email) {
            return redirect()->route('login')->with('error', __('Session expired. Please log in again.'));
        }

        $user = User::where('email', $email)->first();

        // SECURITY CHECK
        if (!$user) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('error', __('User not found or has been deleted.'));
        }

        // SECURITY CHECK
        if ($user->email_verified_at !== null) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('success', __('Your account is already verified. Please log in.'));
        }

        $newCode = random_int(100000, 999999);

        $user->update([
            'otp_code' => $newCode,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new OtpVerificationMail($newCode));

        return back()->with('success', __('A new 6-digit code has been sent to your email.'));
    }

    public function updateEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        ]);

        $oldEmail = $request->session()->get('pending_otp_email');
        $user = User::where('email', $oldEmail)->first();

        // SECURITY CHECK
        if (!$user) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('register')->with('error', __('Session expired. Please register again.'));
        }

        // SECURITY CHECK
        if ($user->email_verified_at !== null) {
            $request->session()->forget('pending_otp_email');
            return redirect()->route('login')->with('success', __('Your account is already verified. You can update your email from the profile settings.'));
        }

        $user->email = $request->email;
        $user->otp_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        $request->session()->put('pending_otp_email', $user->email);

        Mail::to($user->email)->send(new OtpVerificationMail($user->otp_code));

        return back()->with('success', __('Email has been updated and a new OTP sent.'));
    }
}
