<?php

namespace Tests\Feature;

use App\Models\CatalogoFitosanitario;
use App\Models\Diagnostico;
use App\Models\User;
use Database\Seeders\CatalogoFitosanitarioSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DomainSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_and_catalog_can_be_seeded(): void
    {
        $this->seed([RoleSeeder::class, CatalogoFitosanitarioSeeder::class]);

        $this->assertDatabaseHas('roles', ['nombre' => 'agricultor']);
        $this->assertDatabaseHas('roles', ['nombre' => 'tecnico']);
        $this->assertDatabaseHas('roles', ['nombre' => 'administrador']);
        $this->assertDatabaseHas('catalogo_fitosanitario', [
            'codigo' => 'PHY-001',
            'nombre' => 'Roya Amarilla',
        ]);
        $this->assertTrue(CatalogoFitosanitario::query()->where('codigo', 'PHY-000')->exists());
    }

    public function test_uuid_local_is_unique_on_diagnosticos(): void
    {
        $user = User::factory()->create();
        $uuid = (string) Str::uuid();

        Diagnostico::factory()->create([
            'usuario_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'uuid_local' => $uuid,
            'confianza' => 90,
        ]);

        $this->expectException(QueryException::class);

        Diagnostico::factory()->create([
            'usuario_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'uuid_local' => $uuid,
            'confianza' => 91,
        ]);
    }

    public function test_low_confidence_is_marked_inconclusive(): void
    {
        $user = User::factory()->create();

        $diagnostico = Diagnostico::factory()->create([
            'usuario_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'clase' => 'roya_amarilla',
            'confianza' => 40,
        ]);

        $this->assertSame('no_concluyente', $diagnostico->clase);
        $this->assertEquals('40.00', $diagnostico->confianza);
        $this->assertNotNull($diagnostico->severidad);
    }

    public function test_edge_sqlite_schema_file_exists(): void
    {
        $path = database_path('edge/schema.sqlite.sql');

        $this->assertFileExists($path);
        $this->assertStringContainsString('diagnosticos_local', (string) file_get_contents($path));
        $this->assertStringContainsString('uuid_local', (string) file_get_contents($path));
    }
}
