<?php

namespace Tests\Feature;

use App\Models\Alerta;
use App\Models\CatalogoFitosanitario;
use App\Models\Diagnostico;
use App\Models\Parcela;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Consultas de solo lectura de la API (ConsultaController): catalogo, parcelas y alertas.
 * Verifica el aislamiento por tenant y la visibilidad por rol (agricultor vs. staff).
 */
class ConsultaApiTest extends TestCase
{
    use RefreshDatabase;

    private function agricultor(array $attributes = []): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => 'agricultor'], ['descripcion' => 'Agricultor']);

        return User::factory()->create(['rol_id' => $rol->id, 'role' => 'agricultor'] + $attributes);
    }

    private function parcela(User $owner, string $nombre): Parcela
    {
        return Parcela::query()->create([
            'tenant_id' => $owner->tenant_id,
            'usuario_id' => $owner->id,
            'nombre' => $nombre,
            'cultivo' => 'trigo',
        ]);
    }

    private function alerta(User $owner, array $attributes = []): Alerta
    {
        $diagnostico = Diagnostico::factory()->create(['usuario_id' => $owner->id]);

        // $attributes primero: con "+" prevalecen las claves del operando izquierdo.
        return Alerta::query()->create($attributes + [
            'tenant_id' => $owner->tenant_id,
            'diagnostico_id' => $diagnostico->id,
            'usuario_id' => $owner->id,
            'tipo' => 'roya_amarilla',
            'mensaje' => 'Posible roya amarilla sobre el umbral.',
            'leida' => false,
        ]);
    }

    public function test_catalogo_lists_only_active_entries_ordered_by_code(): void
    {
        CatalogoFitosanitario::query()->create(['codigo' => 'RA-02', 'nombre' => 'Roya amarilla', 'cultivo' => 'trigo', 'activo' => true]);
        CatalogoFitosanitario::query()->create(['codigo' => 'AA-01', 'nombre' => 'Sana', 'cultivo' => 'trigo', 'activo' => true]);
        CatalogoFitosanitario::query()->create(['codigo' => 'ZZ-99', 'nombre' => 'Retirada', 'cultivo' => 'trigo', 'activo' => false]);

        Sanctum::actingAs($this->agricultor());

        $this->getJson('/api/catalogo')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.codigo', 'AA-01')
            ->assertJsonPath('data.1.codigo', 'RA-02');
    }

    public function test_agricultor_only_sees_own_parcelas_with_diagnostic_count(): void
    {
        $agricultor = $this->agricultor();
        $vecino = $this->agricultor(['tenant_id' => $agricultor->tenant_id]);
        $otroTenant = $this->agricultor();

        $propia = $this->parcela($agricultor, 'Lote Aramachay Norte');
        $this->parcela($vecino, 'Lote del vecino');
        $this->parcela($otroTenant, 'Lote de otra comunidad');
        Diagnostico::factory()->count(2)->create(['usuario_id' => $agricultor->id, 'parcela_id' => $propia->id]);

        Sanctum::actingAs($agricultor);

        $this->getJson('/api/parcelas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nombre', 'Lote Aramachay Norte')
            ->assertJsonPath('data.0.diagnosticos_count', 2);
    }

    public function test_staff_sees_all_parcelas_of_its_tenant_only(): void
    {
        $tecnico = User::factory()->create();
        $agricultor = $this->agricultor(['tenant_id' => $tecnico->tenant_id]);
        $otroTenant = $this->agricultor();

        $this->parcela($agricultor, 'B - Lote agricultor');
        $this->parcela($tecnico, 'A - Lote tecnico');
        $this->parcela($otroTenant, 'C - Otra comunidad');

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/parcelas')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.nombre', 'A - Lote tecnico')
            ->assertJsonPath('data.1.nombre', 'B - Lote agricultor');
    }

    public function test_alertas_hide_discarded_and_other_users_for_agricultor(): void
    {
        $agricultor = $this->agricultor();
        $vecino = $this->agricultor(['tenant_id' => $agricultor->tenant_id]);

        $visible = $this->alerta($agricultor);
        $this->alerta($agricultor, ['tipo' => 'descartada']);
        $this->alerta($vecino);

        Sanctum::actingAs($agricultor);

        $this->getJson('/api/alertas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id)
            ->assertJsonPath('data.0.diagnostico.clase', 'roya_amarilla');
    }

    public function test_alertas_can_be_filtered_by_unread_for_staff(): void
    {
        $tecnico = User::factory()->create();
        $agricultor = $this->agricultor(['tenant_id' => $tecnico->tenant_id]);

        $this->alerta($agricultor, ['leida' => true]);
        $pendiente = $this->alerta($agricultor);

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/alertas')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/alertas?no_leidas=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $pendiente->id);
    }

    public function test_user_marks_own_alert_as_read(): void
    {
        $agricultor = $this->agricultor();
        $alerta = $this->alerta($agricultor);

        Sanctum::actingAs($agricultor);

        $this->patchJson("/api/alertas/{$alerta->id}/leida")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.leida', true);

        $this->assertTrue($alerta->fresh()->leida);
    }

    public function test_agricultor_cannot_mark_alert_of_another_user_or_tenant(): void
    {
        $agricultor = $this->agricultor();
        $vecino = $this->agricultor(['tenant_id' => $agricultor->tenant_id]);
        $ajena = $this->alerta($vecino);
        $otroTenant = $this->alerta($this->agricultor());

        Sanctum::actingAs($agricultor);

        $this->patchJson("/api/alertas/{$ajena->id}/leida")->assertNotFound();
        $this->patchJson("/api/alertas/{$otroTenant->id}/leida")->assertNotFound();

        $this->assertFalse($ajena->fresh()->leida);
    }
}
