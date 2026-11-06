<?php

namespace App\Providers;

use App\Support\AuthRules;
use Illuminate\Cache\RateLimiting\Limit;
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
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(AuthRules::LOGIN_ATTEMPTS)->by($request->ip());
        });

        // Rate limit diferenciado (rules.md §6): recuperacion, sync y consultas.
        RateLimiter::for('password', function (Request $request) {
            return Limit::perMinute(5)->by('password-ip:'.$request->ip());
        });

        RateLimiter::for('sync', function (Request $request) {
            return Limit::perMinute(30)->by('sync:'.($request->user()?->id ?: $request->ip()));
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by('api:'.($request->user()?->id ?: $request->ip()));
        });
    }
}
