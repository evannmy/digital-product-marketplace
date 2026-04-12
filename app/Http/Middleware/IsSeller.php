<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsSeller
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated AND their role is exactly 'seller'
        // (You can also allow 'admin' here in the future if needed: in_array($role, ['seller', 'admin']))
        if (! $request->user() || $request->user()->role !== 'seller') {
            abort(403, 'Access denied. You must register as a seller to view this page.');
        }

        return $next($request);
    }
}
