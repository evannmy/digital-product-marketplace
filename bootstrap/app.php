<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Added this import
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ShredOtpTicket::class,
            \App\Http\Middleware\SetLocale::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            'midtrans/callback',
            '/midtrans/callback',
        ]);

        $middleware->redirectUsersTo(function () {
            if (Auth::check() && Auth::user()->role === 'admin') {
                return '/admin';
            }

            return '/'; // Normal users get bounced here
        });

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'is_seller' => \App\Http\Middleware\IsSeller::class,
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
            'not_admin' => \App\Http\Middleware\EnsureNotAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            $status = $response->getStatusCode();
            $allowedStatuses = [403, 404, 500, 503];

            // If the error is 404, 403, etc., render our Inertia Error Page
            if (in_array($status, $allowedStatuses)) {
                return \Inertia\Inertia::render('error', [
                    'status' => $status
                ])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
