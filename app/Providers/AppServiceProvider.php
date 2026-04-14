<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\HtmlString;

class AppServiceProvider extends ServiceProvider
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
        $this->configureDefaults();
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Welcome to Soko! Please verify your email')
                ->greeting('Hello, ' . $notifiable->name . '!')
                ->line('Welcome to Soko, the ultimate digital product marketplace. We are thrilled to have you on board!')
                ->line('Before you can start purchasing premium digital assets or setting up your own creator storefront, we just need to quickly verify your email address.')
                ->action('Verify My Account', $url)

                // --- REPLACE THE OLD WARNING WITH THIS STYLED HTML BOX ---
                ->line(new HtmlString('<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px; color: #1e293b; font-size: 15px;"><strong>Note:</strong> If you open this link, you will be asked to log in using the email and password used when registering.</div>'))
                // ---------------------------------------------------------

                ->line('Once verified, you will have full access to download your purchases and leave verified reviews.')
                ->line('If you did not create an account, no further action is required.')
                ->salutation(new HtmlString('Best wishes, <br> The Soko Team'));
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null,
        );
    }
}
