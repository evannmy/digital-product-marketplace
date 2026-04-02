<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Using the Facade resolves the IDE strict typing warnings
        if (!Auth::check() || Auth::user()->role !== $role) {
            abort(403, 'Unauthorized Access: You do not have the required permissions.');
        }

        return $next($request);
    }
}
