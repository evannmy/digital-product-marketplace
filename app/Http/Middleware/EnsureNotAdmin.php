<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If the user is logged in AND their role is admin, bounce them!
        if (Auth::check() && Auth::user()->role === 'admin') {
            return redirect('/admin');
        }

        // Otherwise, let them proceed normally
        return $next($request);
    }
}
