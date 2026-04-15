<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpVerificationMail;

class OtpController extends Controller
{
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric|digits:6',
        ]);

        $user = $request->user();

        // 1. Security Check: Has the time expired?
        if (now()->isAfter($user->otp_expires_at)) {
            return back()->with('error', 'Your verification code has expired. Please request a new one.');
        }

        // 2. Logic Check: Does the code match?
        if ($user->otp_code === $request->code) {
            $user->markEmailAsVerified();

            // Success! Clear the OTP data to keep the database clean
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null,
            ]);

            return redirect()->route('dashboard')->with('success', 'Email verified successfully!');
        }

        return back()->with('error', 'Invalid verification code. Please try again.');
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        // Generate a fresh code
        $newCode = random_int(100000, 999999);

        // Update the database and reset the 10-minute clock
        $user->update([
            'otp_code' => $newCode,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        // Send the new email
        Mail::to($user->email)->send(new OtpVerificationMail($newCode));

        return back()->with('success', 'A new 6-digit code has been sent to your email.');
    }
}
