<?php

namespace Tests\Feature;

use App\Providers\AppServiceProvider;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Detras de un tunel HTTPS (cloudflared/ngrok) o un balanceador, Laravel debe
 * generar las URLs de /build con el host y esquema publicos; si no, la PWA
 * carga el HTML pero no su JS y queda en blanco.
 */
class TrustedProxiesTest extends TestCase
{
    private const TUNNEL_HEADERS = [
        'X-Forwarded-Proto' => 'https',
        'X-Forwarded-Host' => 'demo.trycloudflare.com',
        'X-Forwarded-Port' => '443',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        Route::get('/_test/url-raiz', fn () => url('/build/app.js'));
    }

    protected function tearDown(): void
    {
        TrustProxies::flushState();

        parent::tearDown();
    }

    private function bootProxies(?string $proxies): void
    {
        TrustProxies::flushState();
        config(['app.trusted_proxies' => $proxies]);
        (new AppServiceProvider($this->app))->boot();
    }

    public function test_forwarded_headers_are_ignored_without_trusted_proxies(): void
    {
        $this->bootProxies(null);

        $this->withHeaders(self::TUNNEL_HEADERS)
            ->get('/_test/url-raiz')
            ->assertDontSee('demo.trycloudflare.com', false);
    }

    public function test_asset_urls_use_https_public_host_behind_trusted_tunnel(): void
    {
        $this->bootProxies('127.0.0.1');

        $this->withHeaders(self::TUNNEL_HEADERS)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->get('/_test/url-raiz')
            ->assertSee('https://demo.trycloudflare.com/build/app.js', false);
    }

    public function test_forwarded_headers_from_untrusted_addresses_are_ignored(): void
    {
        $this->bootProxies('127.0.0.1');

        $this->withHeaders(self::TUNNEL_HEADERS)
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])
            ->get('/_test/url-raiz')
            ->assertDontSee('demo.trycloudflare.com', false);
    }
}
