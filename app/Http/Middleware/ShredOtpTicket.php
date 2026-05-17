<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShredOtpTicket
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Define the routes where the user is ALLOWED to hold the ticket
        $allowedRoutes = [
            'verification.*', // All OTP routes
            'login',          // The Login page
            'register',       // The Register page
            'logout',         // Logging out
            'password.*',     // Password reset pages
        ];

        // 2. If the user visits ANY route that is NOT in the list above...
        if (!$request->routeIs($allowedRoutes)) {

            // SHRED THE TICKET!
            $request->session()->forget('pending_otp_email');
        }

        return $next($request);
    }
}
