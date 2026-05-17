<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePendingOtpSession
{
    public function handle(Request $request, Closure $next): Response
    {
        // If they do NOT have the temporary session ticket, they typed the URL directly!
        if (!$request->session()->has('pending_otp_email')) {
            // Kick them to the login page silently
            return redirect()->route('login');
        }

        // They have the ticket, let them see the OTP page
        return $next($request);
    }
}
