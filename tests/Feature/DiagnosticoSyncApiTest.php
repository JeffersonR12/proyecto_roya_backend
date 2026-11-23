<?php

namespace Tests\Feature;

use App\Models\Diagnostico;
use App\Models\SyncEvent;
use App\Models\User;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class DiagnosticoSyncApiTest extends TestCase
{
    use RefreshDatabase;

    /** PNG de 1x1 valido. */
    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function item(array $overrides = []): array
    {
        return [
            'uuid_local' => (string) Str::uuid(),
            'clase' => 'roya_amarilla',
            'confianza' => 91.5,
            'severidad' => null,
            'latitud' => -12.0464,
            'longitud' => -77.0428,
            'modelo_version' => 'roya-mobilenetv3-small-v1',
            'captured_at' => now()->toIso8601String(),
            'ubicacion' => 'Lote Norte',
            'imagen' => self::PNG,
            ...$overrides,
        ];
    }

    private function sync(User $user, array $items)
    {
        return $this->actingAs($user)->postJson('/api/diagnosticos/sync', ['diagnosticos' => $items]);
    }

    public function test_guest_cannot_sync(): void
    {
        $this->postJson('/api/diagnosticos/sync', ['diagnosticos' => [$this->item()]])->assertUnauthorized();
    }

    public function test_sync_creates_diagnostico_with_server_side_tenant_and_user(): void
    {
        $user = User::factory()->agricultor()->create();
        $otro = User::factory()->create();
        $item = $this->item(['tenant_id' => $otro->tenant_id, 'usuario_id' => $otro->id]);

        $this->sync($user, [$item])
            ->assertOk()
            ->assertJson(['confirmados' => [$item['uuid_local']], 'rechazados' => []]);

        $diagnostico = Diagnostico::query()->withoutGlobalScopes()->where('uuid_local', $item['uuid_local'])->firstOrFail();

        $this->assertSame((int) $user->tenant_id, (int) $diagnostico->tenant_id);
        $this->assertSame((int) $user->id, (int) $diagnostico->usuario_id);
        $this->assertSame('Lote Norte', $diagnostico->ubicacion);
        $this->assertSame('pending', $diagnostico->hitl_status);
        $this->assertNotNull($diagnostico->synced_at);
        Storage::disk('local')->assertExists($diagnostico->imagen_path);
        $this->assertStringStartsWith("diagnosticos/{$user->tenant_id}/", $diagnostico->imagen_path);
    }

    public function test_storage_failure_returns_503_and_saves_nothing_so_the_pwa_retries(): void
    {
        $user = User::factory()->agricultor()->create();
        $item = $this->item();

        // Disco que rechaza la escritura sin lanzar (asi se comporta S3 con 'throw' => false).
        $disk = \Mockery::mock(Filesystem::class);
        $disk->shouldReceive('put')->andReturnFalse();
        $disk->shouldReceive('delete')->andReturnTrue();
        Storage::set(config('filesystems.diagnosticos_disk'), $disk);

        $this->sync($user, [$item])
            ->assertStatus(503)
            ->assertHeader('Retry-After', '60');

        $this->assertFalse(
            Diagnostico::query()->withoutGlobalScopes()->where('uuid_local', $item['uuid_local'])->exists(),
            'No debe quedar un diagnostico apuntando a una foto que no se guardo.'
        );

        // Cuando el almacenamiento vuelve, el mismo lote entra normal.
        Storage::fake(config('filesystems.diagnosticos_disk'));
        $this->sync($user, [$item])->assertOk()->assertJson(['confirmados' => [$item['uuid_local']]]);
    }

    public function test_sending_the_same_batch_three_times_keeps_one_row_per_uuid(): void
    {
        $user = User::factory()->agricultor()->create();
        $lote = [$this->item(), $this->item(['clase' => 'sana', 'confianza' => 88])];
        $uuids = array_column($lote, 'uuid_local');

        foreach (range(1, 3) as $intento) {
            $this->sync($user, $lote)
                ->assertOk()
                ->assertJson(['confirmados' => $uuids, 'rechazados' => []]);
        }

        foreach ($uuids as $uuid) {
            $this->assertSame(1, Diagnostico::query()->withoutGlobalScopes()->where('uuid_local', $uuid)->count());
        }

        $this->assertSame(6, SyncEvent::query()->count());
        $this->assertSame(4, SyncEvent::query()->where('estado', 'duplicate')->count());
    }

    public function test_uuid_owned_by_another_tenant_is_rejected_not_confirmed(): void
    {
        $ajeno = Diagnostico::factory()->create();
        $user = User::factory()->agricultor()->create();

        $this->sync($user, [$this->item(['uuid_local' => $ajeno->uuid_local])])
            ->assertOk()
            ->assertJsonPath('confirmados', [])
            ->assertJsonPath('rechazados.0.uuid_local', $ajeno->uuid_local);

        $this->assertSame((int) $ajeno->tenant_id, (int) $ajeno->fresh()->tenant_id);
    }

    public function test_agricultor_cannot_bring_a_review_inside_the_batch(): void
    {
        $user = User::factory()->agricultor()->create();
        $item = $this->item(['hitl_status' => 'validated', 'etiqueta_humana' => 'sana']);

        $this->sync($user, [$item])->assertOk();

        $diagnostico = Diagnostico::query()->withoutGlobalScopes()->where('uuid_local', $item['uuid_local'])->first();
        $this->assertSame('pending', $diagnostico->hitl_status);
        $this->assertNull($diagnostico->etiqueta_humana);
    }

    public function test_invalid_image_returns_422(): void
    {
        $user = User::factory()->agricultor()->create();
        $texto = 'data:image/png;base64,'.base64_encode('esto no es una imagen');

        $this->sync($user, [$this->item(), $this->item(['imagen' => $texto])])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['diagnosticos.1.imagen']);

        $this->assertSame(0, Diagnostico::query()->withoutGlobalScopes()->count());
    }

    public function test_batch_over_fifty_returns_422(): void
    {
        $user = User::factory()->agricultor()->create();
        $lote = array_map(fn () => $this->item(), range(1, 51));

        $this->sync($user, $lote)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['diagnosticos']);
    }

    public function test_agricultor_lists_only_own_diagnosticos(): void
    {
        $agricultor = User::factory()->agricultor()->create();
        $vecino = User::factory()->agricultor()->create(['tenant_id' => $agricultor->tenant_id]);
        $propio = Diagnostico::factory()->create(['usuario_id' => $agricultor->id]);
        Diagnostico::factory()->create(['usuario_id' => $vecino->id]);

        $this->actingAs($agricultor)->getJson('/api/diagnosticos')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid_local', $propio->uuid_local);
    }

    public function test_tecnico_lists_whole_tenant_but_never_other_tenants(): void
    {
        $tecnico = User::factory()->create();
        $agricultor = User::factory()->agricultor()->create(['tenant_id' => $tecnico->tenant_id]);
        $ajeno = User::factory()->agricultor()->create();
        Diagnostico::factory()->create(['usuario_id' => $agricultor->id]);
        Diagnostico::factory()->create(['usuario_id' => $tecnico->id]);
        $deOtroTenant = Diagnostico::factory()->create(['usuario_id' => $ajeno->id]);

        $response = $this->actingAs($tecnico)->getJson('/api/diagnosticos')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertNotContains($deOtroTenant->uuid_local, array_column($response->json('data'), 'uuid_local'));
    }

    public function test_cannot_review_or_view_image_of_another_tenant(): void
    {
        $tecnico = User::factory()->create();
        $ajeno = Diagnostico::factory()->create();

        $this->actingAs($tecnico)
            ->patchJson("/api/diagnosticos/{$ajeno->uuid_local}/revision", ['hitl_status' => 'validated'])
            ->assertNotFound();

        $this->actingAs($tecnico)
            ->get("/api/diagnosticos/{$ajeno->uuid_local}/imagen")
            ->assertNotFound();

        $this->assertNotSame('validated', $ajeno->fresh()->hitl_status);
    }

    public function test_agricultor_gets_403_on_review(): void
    {
        $agricultor = User::factory()->agricultor()->create();
        $diagnostico = Diagnostico::factory()->create(['usuario_id' => $agricultor->id]);

        $this->actingAs($agricultor)
            ->patchJson("/api/diagnosticos/{$diagnostico->uuid_local}/revision", ['hitl_status' => 'validated'])
            ->assertForbidden();
    }

    public function test_user_without_role_is_not_treated_as_staff(): void
    {
        $sinRol = User::factory()->create(['rol_id' => null, 'role' => 'visitante']);
        $diagnostico = Diagnostico::factory()->create(['usuario_id' => $sinRol->id]);

        $this->actingAs($sinRol)
            ->patchJson("/api/diagnosticos/{$diagnostico->uuid_local}/revision", ['hitl_status' => 'validated'])
            ->assertForbidden();
    }

    public function test_tecnico_reviews_diagnostico_of_its_tenant(): void
    {
        $tecnico = User::factory()->create();
        $agricultor = User::factory()->agricultor()->create(['tenant_id' => $tecnico->tenant_id]);
        $diagnostico = Diagnostico::factory()->create(['usuario_id' => $agricultor->id]);

        $this->actingAs($tecnico)
            ->patchJson("/api/diagnosticos/{$diagnostico->uuid_local}/revision", [
                'hitl_status' => 'rejected',
                'etiqueta_humana' => 'otra_enfermedad',
            ])
            ->assertOk()
            ->assertJsonPath('data.hitl_status', 'rejected')
            ->assertJsonPath('data.etiqueta_humana', 'otra_enfermedad');

        $this->actingAs($tecnico)
            ->patchJson("/api/diagnosticos/{$diagnostico->uuid_local}/revision", ['hitl_status' => 'aprobado'])
            ->assertUnprocessable();
    }

    public function test_another_user_of_the_same_tenant_cannot_claim_a_synced_uuid(): void
    {
        $ana = User::factory()->admin()->create();
        $maria = User::factory()->agricultor()->create(['tenant_id' => $ana->tenant_id]);
        $item = $this->item();

        $this->sync($maria, [$item])->assertOk()->assertJsonPath('confirmados', [$item['uuid_local']]);

        // Mismo dispositivo, otra sesion: el mismo registro llega con la cuenta de Ana.
        $this->sync($ana, [$item])
            ->assertOk()
            ->assertJsonPath('confirmados', [])
            ->assertJsonPath('rechazados.0.uuid_local', $item['uuid_local']);

        $diagnostico = Diagnostico::query()->withoutGlobalScopes()->where('uuid_local', $item['uuid_local'])->first();
        $this->assertSame((int) $maria->id, (int) $diagnostico->usuario_id);
    }

    public function test_index_meta_identifies_the_session_user(): void
    {
        $user = User::factory()->agricultor()->create();

        $this->actingAs($user)->getJson('/api/diagnosticos')
            ->assertOk()
            ->assertJsonPath('meta.usuario_id', $user->id)
            ->assertJsonPath('meta.tenant_id', $user->tenant_id);
    }

    public function test_view_exposes_auth_user_with_real_role(): void
    {
        $maria = User::factory()->agricultor()->create(['role' => 'tecnico']);

        $this->actingAs($maria)->get('/')
            ->assertOk()
            ->assertViewHas('authUser', function (array $authUser) use ($maria) {
                return $authUser['id'] === $maria->id
                    && $authUser['tenant_id'] === (int) $maria->tenant_id
                    && $authUser['rol']['nombre'] === 'agricultor'
                    && $authUser['role'] === 'agricultor'
                    && ! array_key_exists('phone', $authUser);
            });
    }

    public function test_owner_can_view_image(): void
    {
        $user = User::factory()->agricultor()->create();
        $item = $this->item();
        $this->sync($user, [$item])->assertOk();

        $this->actingAs($user)
            ->get("/api/diagnosticos/{$item['uuid_local']}/imagen")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');
    }
}
