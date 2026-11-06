<?php

namespace Tests\Feature;

use App\Models\Alerta;
use App\Models\Diagnostico;
use App\Models\Parcela;
use App\Models\Role;
use App\Models\SyncEvent;
use App\Models\User;
use Database\Seeders\CatalogoFitosanitarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SyncDiagnosticosApiTest extends TestCase
{
    use RefreshDatabase;

    /** JPEG minimo valido (1x1 px). */
    private const JPEG_1PX = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogoFitosanitarioSeeder::class);
        Storage::fake('local');
    }

    private function agricultor(array $attributes = []): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => 'agricultor'], ['descripcion' => 'Agricultor']);

        return User::factory()->create(['rol_id' => $rol->id, 'role' => 'agricultor'] + $attributes);
    }

    private function item(array $override = []): array
    {
        return array_merge([
            'uuid_local' => (string) Str::uuid(),
            'clase' => 'roya_amarilla',
            'confianza' => 94.5,
            'severidad' => null,
            'modelo_version' => 'roya-mobilenetv3-small-v1',
            'captured_at' => '2026-10-04T10:30:00-05:00',
            'latitud' => -11.92,
            'longitud' => -75.31,
            'parcela_nombre' => 'Lote Norte',
            'hitl_status' => 'pending',
        ], $override);
    }

    public function test_guest_cannot_sync(): void
    {
        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item()]])
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_batch_is_created_and_confirmed(): void
    {
        $user = $this->agricultor();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/sync/diagnosticos', [
            'items' => [$this->item(), $this->item(['clase' => 'sana', 'confianza' => 88, 'hitl_status' => 'not_required'])],
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.processed', 2)
            ->assertJsonPath('data.created', 2)
            ->assertJsonPath('data.items.0.status', 'confirmed');

        $this->assertSame(2, Diagnostico::query()->withoutGlobalScopes()->count());
        $diag = Diagnostico::query()->withoutGlobalScopes()->where('clase', 'roya_amarilla')->first();
        $this->assertSame($user->tenant_id, $diag->tenant_id);
        $this->assertSame('confirmed', $diag->sync_status);
        $this->assertNotNull($diag->synced_at);
        $this->assertSame('PHY-001', $diag->catalogo->codigo);
        $this->assertSame('Lote Norte', $diag->parcela->nombre);
    }

    public function test_repeated_uuid_with_same_content_is_idempotent(): void
    {
        Sanctum::actingAs($this->agricultor());
        $item = $this->item();

        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]])->assertJsonPath('data.created', 1);
        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]])
            ->assertOk()
            ->assertJsonPath('data.created', 0)
            ->assertJsonPath('data.already_exists', 1)
            ->assertJsonPath('data.items.0.status', 'already_exists');

        $this->assertSame(1, Diagnostico::query()->withoutGlobalScopes()->count());
        $evento = SyncEvent::query()->where('uuid_local', $item['uuid_local'])->first();
        $this->assertSame(2, $evento->intentos);
        $this->assertSame('already_exists', $evento->estado);
    }

    public function test_repeated_uuid_with_different_content_is_a_conflict(): void
    {
        Sanctum::actingAs($this->agricultor());
        $item = $this->item();

        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]]);
        $this->postJson('/api/sync/diagnosticos', ['items' => [array_merge($item, ['confianza' => 80])]])
            ->assertOk()
            ->assertJsonPath('data.failed', 1)
            ->assertJsonPath('data.items.0.status', 'conflict');

        $this->assertEquals(94.5, (float) Diagnostico::query()->withoutGlobalScopes()->first()->confianza);
        $this->assertSame('conflict', SyncEvent::query()->where('uuid_local', $item['uuid_local'])->value('estado'));
    }

    public function test_uuid_from_another_tenant_is_never_overwritten_or_revealed(): void
    {
        $item = $this->item();
        Sanctum::actingAs($this->agricultor());
        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]]);

        Sanctum::actingAs($this->agricultor());
        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]])
            ->assertJsonPath('data.items.0.status', 'conflict');

        $this->assertSame(1, Diagnostico::query()->withoutGlobalScopes()->count());
    }

    public function test_low_confidence_is_stored_as_inconclusive(): void
    {
        Sanctum::actingAs($this->agricultor());

        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item(['confianza' => 60])]])->assertOk();

        $this->assertSame('no_concluyente', Diagnostico::query()->withoutGlobalScopes()->value('clase'));
        $this->assertSame(0, Alerta::query()->withoutGlobalScopes()->count());
    }

    public function test_out_of_range_values_and_missing_model_version_are_rejected(): void
    {
        Sanctum::actingAs($this->agricultor());

        $this->postJson('/api/sync/diagnosticos', [
            'items' => [$this->item(['confianza' => 120, 'severidad' => -1, 'modelo_version' => null])],
        ])->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['items.0.confianza', 'items.0.severidad', 'items.0.modelo_version']);

        $this->assertSame(0, Diagnostico::query()->withoutGlobalScopes()->count());
    }

    public function test_thumbnail_is_stored_privately_and_served_with_access_control(): void
    {
        $user = $this->agricultor();
        Sanctum::actingAs($user);
        $item = $this->item(['imagen_base64' => self::JPEG_1PX]);

        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]])->assertJsonPath('data.created', 1);

        $path = Diagnostico::query()->withoutGlobalScopes()->value('imagen_path');
        Storage::disk('local')->assertExists($path);
        $this->get("/api/diagnosticos/{$item['uuid_local']}/imagen")->assertOk();

        Sanctum::actingAs($this->agricultor());
        $this->getJson("/api/diagnosticos/{$item['uuid_local']}/imagen")->assertNotFound();
    }

    public function test_fake_image_content_is_rejected(): void
    {
        Sanctum::actingAs($this->agricultor());
        $falsa = 'data:image/jpeg;base64,'.base64_encode('<?php echo "no soy imagen";');

        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item(['imagen_base64' => $falsa])]])
            ->assertOk()
            ->assertJsonPath('data.items.0.status', 'rejected');

        $this->assertSame(0, Diagnostico::query()->withoutGlobalScopes()->count());
    }

    public function test_parcela_from_another_tenant_is_rejected(): void
    {
        $otro = $this->agricultor();
        $ajena = Parcela::query()->create([
            'tenant_id' => $otro->tenant_id,
            'usuario_id' => $otro->id,
            'nombre' => 'Ajena',
        ]);

        Sanctum::actingAs($this->agricultor());
        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item(['parcela_id' => $ajena->id, 'parcela_nombre' => null])]])
            ->assertJsonPath('data.items.0.status', 'rejected');
    }

    public function test_affirmed_roya_creates_alert_and_critical_severity_escalates(): void
    {
        Sanctum::actingAs($this->agricultor());

        $this->postJson('/api/sync/diagnosticos', [
            'items' => [$this->item(), $this->item(['severidad' => 35])],
        ]);

        $tipos = Alerta::query()->withoutGlobalScopes()->pluck('tipo')->sort()->values()->all();
        $this->assertSame(['roya_critica', 'roya_detectada'], $tipos);
    }

    public function test_farmer_cannot_self_validate_hitl(): void
    {
        Sanctum::actingAs($this->agricultor());

        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item(['hitl_status' => 'validated'])]]);

        $this->assertSame('pending', Diagnostico::query()->withoutGlobalScopes()->value('hitl_status'));
    }

    public function test_staff_hitl_change_is_applied_on_resync(): void
    {
        $tecnico = User::factory()->create();
        Sanctum::actingAs($tecnico);
        $item = $this->item();

        $this->postJson('/api/sync/diagnosticos', ['items' => [$item]]);
        $this->postJson('/api/sync/diagnosticos', ['items' => [array_merge($item, ['hitl_status' => 'rejected', 'etiqueta_humana' => 'otra_enfermedad'])]])
            ->assertJsonPath('data.items.0.status', 'already_exists');

        $diag = Diagnostico::query()->withoutGlobalScopes()->first();
        $this->assertSame('rejected', $diag->hitl_status);
        $this->assertSame('otra_enfermedad', $diag->etiqueta_humana);
        $this->assertSame('descartada', Alerta::query()->withoutGlobalScopes()->value('tipo'));
    }

    public function test_listing_respects_role_and_tenant(): void
    {
        $agricultor = $this->agricultor();
        $companero = $this->agricultor(['tenant_id' => $agricultor->tenant_id]);
        $tecnico = User::factory()->create(['tenant_id' => $agricultor->tenant_id]);
        $externo = User::factory()->create();

        foreach ([$agricultor, $companero, $externo] as $user) {
            Diagnostico::factory()->create(['usuario_id' => $user->id, 'tenant_id' => $user->tenant_id]);
        }

        Sanctum::actingAs($agricultor);
        $this->getJson('/api/diagnosticos')->assertOk()->assertJsonPath('meta.total', 1);

        Sanctum::actingAs($tecnico);
        $this->getJson('/api/diagnosticos')->assertOk()->assertJsonPath('meta.total', 2);
    }

    public function test_only_staff_can_patch_and_only_admin_can_delete(): void
    {
        $agricultor = $this->agricultor();
        $diag = Diagnostico::factory()->create(['usuario_id' => $agricultor->id, 'tenant_id' => $agricultor->tenant_id]);
        $tecnico = User::factory()->create(['tenant_id' => $agricultor->tenant_id]);
        $admin = User::factory()->admin()->create(['tenant_id' => $agricultor->tenant_id]);

        Sanctum::actingAs($agricultor);
        $this->patchJson("/api/diagnosticos/{$diag->uuid_local}", ['hitl_status' => 'validated'])->assertForbidden();

        Sanctum::actingAs($tecnico);
        $this->patchJson("/api/diagnosticos/{$diag->uuid_local}", ['hitl_status' => 'validated'])
            ->assertOk()
            ->assertJsonPath('data.hitl_status', 'validated');
        $this->deleteJson("/api/diagnosticos/{$diag->uuid_local}")->assertForbidden();

        Sanctum::actingAs($admin);
        $this->deleteJson("/api/diagnosticos/{$diag->uuid_local}")->assertOk();
        $this->assertSoftDeleted('diagnosticos', ['id' => $diag->id]);
    }

    public function test_inactive_user_is_forbidden(): void
    {
        Sanctum::actingAs($this->agricultor(['activo' => false]));

        $this->getJson('/api/diagnosticos')->assertForbidden();
    }

    public function test_sync_status_and_health_endpoints(): void
    {
        Sanctum::actingAs($this->agricultor());
        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item()]]);

        $this->getJson('/api/sync/status')
            ->assertOk()
            ->assertJsonPath('data.diagnosticos_en_nube', 1)
            ->assertJsonPath('data.eventos_24h.confirmed', 1);

        $this->getJson('/api/health')->assertOk()->assertJsonPath('data.database', 'ok');
    }

    public function test_session_authenticated_pwa_can_sync(): void
    {
        $this->actingAs($this->agricultor());

        $this->postJson('/api/sync/diagnosticos', ['items' => [$this->item()]])
            ->assertOk()
            ->assertJsonPath('data.created', 1);
    }
}
