<?php

namespace Tests\Feature;

use App\Models\Diagnostico;
use App\Models\Parcela;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantDiagnosticoTest extends TestCase
{
    use RefreshDatabase;

    public function test_diagnosticos_are_isolated_by_tenant(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $diagA = Diagnostico::factory()->create([
            'usuario_id' => $userA->id,
            'tenant_id' => $userA->tenant_id,
            'confianza' => 90,
        ]);
        Diagnostico::factory()->create([
            'usuario_id' => $userB->id,
            'tenant_id' => $userB->tenant_id,
            'confianza' => 91,
        ]);

        $this->actingAs($userA);

        $visible = Diagnostico::query()->pluck('id');

        $this->assertCount(1, $visible);
        $this->assertTrue($visible->contains($diagA->id));
        $this->assertNotEquals($userA->tenant_id, $userB->tenant_id);
    }

    public function test_confidence_at_threshold_keeps_predicted_class(): void
    {
        $diagnostico = Diagnostico::factory()->create([
            'clase' => 'roya_amarilla',
            'confianza' => Diagnostico::UMBRAL_CONFIANZA,
            'severidad' => 18.5,
        ]);

        $this->assertSame('roya_amarilla', $diagnostico->clase);
        $this->assertEquals('75.00', $diagnostico->confianza);
        $this->assertEquals('18.50', $diagnostico->severidad);
    }

    public function test_confianza_and_severidad_remain_independent_fields(): void
    {
        $diagnostico = Diagnostico::factory()->create([
            'clase' => 'roya_amarilla',
            'confianza' => 92.25,
            'severidad' => 11.00,
        ]);

        $this->assertSame('roya_amarilla', $diagnostico->clase);
        $this->assertEquals('92.25', $diagnostico->confianza);
        $this->assertEquals('11.00', $diagnostico->severidad);
        $this->assertNotEquals($diagnostico->confianza, $diagnostico->severidad);
    }

    public function test_uuid_local_and_pending_status_are_assigned_when_missing(): void
    {
        $user = User::factory()->create();

        $diagnostico = new Diagnostico([
            'usuario_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'clase' => 'sana',
            'confianza' => 88,
            'severidad' => null,
            'imagen_path' => 'diagnosticos/campo.jpg',
            'modelo_version' => 'roya-mobilenetv3-small-v1',
            'captured_at' => now(),
            'sync_status' => 'pending',
        ]);
        $diagnostico->save();

        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            (string) $diagnostico->uuid_local
        );
        $this->assertSame('pending', $diagnostico->sync_status);
        $this->assertSame('sana', $diagnostico->clase);
        $this->assertSame('roya-mobilenetv3-small-v1', $diagnostico->modelo_version);
    }

    public function test_email_is_unique_per_tenant_not_globally(): void
    {
        $email = 'compartido@gmail.com';
        $userA = User::factory()->create(['email' => $email]);
        $userB = User::factory()->create(['email' => $email]);

        $this->assertNotEquals($userA->tenant_id, $userB->tenant_id);
        $this->assertSame($email, $userA->email);
        $this->assertSame($email, $userB->email);

        $this->expectException(QueryException::class);

        User::factory()->create([
            'email' => $email,
            'tenant_id' => $userA->tenant_id,
        ]);
    }

    public function test_parcelas_are_isolated_by_tenant(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $parcelaB = Parcela::query()->create([
            'tenant_id' => $userB->tenant_id,
            'usuario_id' => $userB->id,
            'nombre' => 'Lote Valle Sur',
            'cultivo' => 'trigo',
        ]);

        $this->actingAs($userA);

        $this->assertNull(Parcela::query()->find($parcelaB->id));
        $this->assertSame(0, Parcela::query()->count());
    }
}
