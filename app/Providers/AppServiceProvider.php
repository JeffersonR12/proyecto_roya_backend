<?php

namespace App\Providers;

use App\Support\AuthRules;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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
        $this->configureTrustedProxies(config('app.trusted_proxies'));

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(AuthRules::LOGIN_ATTEMPTS)->by($request->ip());
        });

        // Frenan la creacion masiva de cuentas y el abuso del envio de correos.
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(AuthRules::PUBLIC_FORM_ATTEMPTS)->by('register|'.$request->ip());
        });

        RateLimiter::for('password', function (Request $request) {
            return Limit::perMinute(AuthRules::PUBLIC_FORM_ATTEMPTS)->by('password|'.$request->ip());
        });
    }

    /**
     * Respeta X-Forwarded-Proto/Host del proxy configurado (ver config/app.php).
     */
    private function configureTrustedProxies(?string $proxies): void
    {
        $proxies = trim((string) $proxies);

        if ($proxies === '') {
            return;
        }

        TrustProxies::at($proxies === '*' ? '*' : array_values(array_filter(array_map('trim', explode(',', $proxies)))));
    }
}
