<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Contracts\LoginResponse;
use Illuminate\Support\Facades\Auth;

// --- NEW IMPORTS REQUIRED FOR CUSTOM AUTHENTICATION ---
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();

        // --- NEW: Custom Authentication Check (Suspended Users) ---
        Fortify::authenticateUsing(function (Request $request) {
            // Because we kept the field name as "email" in React, 
            // the input will be in $request->email, even if they typed a username!
            $loginInput = $request->email;

            // Find the user by checking BOTH the email and username columns
            $user = User::where('email', $loginInput)
                ->orWhere('username', $loginInput)
                ->first();

            // 1. Check if user exists and password is correct
            if ($user && Hash::check($request->password, $user->password)) {

                // 2. Block if the account is suspended (is_active is false)
                if (! $user->is_active) {
                    throw ValidationException::withMessages([
                        Fortify::username() => __('Your account has been suspended. Please contact the administrator.'),
                    ]);
                }

                // 3. If active, return user to continue to the LoginResponse below
                return $user;
            }

            // Return null if password/email is wrong (triggers default Fortify error)
            return null;
        });


        // TRIGGER 1: After Registration
        $this->app->singleton(RegisterResponse::class, function () {
            return new class implements RegisterResponse {
                public function toResponse($request)
                {
                    // 1. Give them the session ticket
                    $request->session()->put('pending_otp_email', Auth::user()->email);

                    // 2. Log them out (so they aren't trapped if they leave the page)
                    Auth::logout();

                    // 3. Send them to the OTP page
                    return redirect()->route('verification.notice');
                }
            };
        });

        // TRIGGER 2: After Login
        $this->app->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse {
                public function toResponse($request)
                {
                    $user = Auth::user();

                    // Check if they lack the email_verified_at timestamp
                    if (is_null($user->email_verified_at)) {

                        // 1. Give them the session ticket
                        $request->session()->put('pending_otp_email', $user->email);

                        // 2. Log them out immediately
                        Auth::logout();

                        // 3. Send them to the OTP page
                        return redirect()->route('verification.notice');
                    }

                    // --- NEW: ADMIN TRAFFIC COP ---
                    // Check if the user is an admin. Update 'role' to match your DB column if necessary.
                    if ($user->role === 'admin') {
                        return redirect()->intended('/admin');
                    }

                    // If they ARE verified and are normal users, let them log in normally to the home page!
                    return redirect()->intended(config('fortify.home'));
                }
            };
        });
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
