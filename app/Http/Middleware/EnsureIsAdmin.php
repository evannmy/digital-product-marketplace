<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Objectively verify authentication and role
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request);
        }

        // Return a 403 Forbidden instead of redirecting, to prevent looping and expose less info.
        abort(403, 'Unauthorized action.');
    }
}
