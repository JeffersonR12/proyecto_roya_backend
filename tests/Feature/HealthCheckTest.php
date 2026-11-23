<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * /health alimenta al monitor externo: 200 solo si base, disco, fotos, cola y modelo
 * responden; 503 en cuanto uno falla. Nunca expone detalles del error.
 */
class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake(config('filesystems.diagnosticos_disk'));
    }

    public function test_responde_200_cuando_todo_funciona(): void
    {
        $this->getJson('/health')
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertExactJson([
                'status' => 'ok',
                'checks' => [
                    'database' => 'ok',
                    'storage' => 'ok',
                    'fotos' => 'ok',
                    'cola' => 'ok',
                    'modelo' => 'ok',
                ],
            ]);
    }

    public function test_responde_503_cuando_la_base_de_datos_no_responde(): void
    {
        $original = config('database.default');

        try {
            $this->assertHealthFailsWithUnreachableDatabase();
        } finally {
            // RefreshDatabase hace rollback sobre la conexion por defecto: hay que devolverla.
            config(['database.default' => $original]);
        }
    }

    private function assertHealthFailsWithUnreachableDatabase(): void
    {
        config([
            'database.connections.caida' => [
                'driver' => 'mysql',
                'host' => '127.0.0.1',
                'port' => 1,
                'database' => 'nada',
                'username' => 'nadie',
                'password' => 'CLAVE_SECRETA',
                'options' => [\PDO::ATTR_TIMEOUT => 1],
            ],
            'database.default' => 'caida',
        ]);
        DB::purge('caida');

        $response = $this->getJson('/health')
            ->assertStatus(503)
            ->assertJsonPath('status', 'fail')
            ->assertJsonPath('checks.database', 'fail');

        // Sin detalles del error: ni host, ni usuario, ni clave.
        $body = $response->getContent();
        $this->assertStringNotContainsString('CLAVE_SECRETA', $body);
        $this->assertStringNotContainsString('127.0.0.1', $body);
        $this->assertStringNotContainsString('SQLSTATE', $body);
    }

    public function test_responde_503_si_hay_trabajos_fallidos_recientes(): void
    {
        DB::table('failed_jobs')->insert([
            'uuid' => 'b4c5d6e7-0000-4000-8000-000000000001',
            'connection' => 'database',
            'queue' => 'default',
            'payload' => '{}',
            'exception' => 'Prueba',
            'failed_at' => now()->subHour(),
        ]);

        $this->getJson('/health')
            ->assertStatus(503)
            ->assertJsonPath('checks.cola', 'fail')
            ->assertJsonPath('checks.database', 'ok');
    }

    public function test_ignora_trabajos_fallidos_antiguos(): void
    {
        DB::table('failed_jobs')->insert([
            'uuid' => 'b4c5d6e7-0000-4000-8000-000000000002',
            'connection' => 'database',
            'queue' => 'default',
            'payload' => '{}',
            'exception' => 'Prueba',
            'failed_at' => now()->subDays(3),
        ]);

        $this->getJson('/health')->assertOk()->assertJsonPath('checks.cola', 'ok');
    }

    public function test_no_abre_sesion_ni_envia_cookies(): void
    {
        $this->get('/health')->assertOk()->assertCookieMissing(config('session.cookie'));
    }
}
