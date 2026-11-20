<?php

namespace Tests\Feature;

use App\Models\Diagnostico;
use App\Models\Role;
use App\Models\User;
use App\Services\ReporteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Modulo de reportes: indicadores calculados sobre registros reales de la tabla diagnosticos.
 */
class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    private function agricultor(array $attributes = []): User
    {
        $rol = Role::query()->firstOrCreate(['nombre' => 'agricultor'], ['descripcion' => 'Agricultor']);

        return User::factory()->create(['rol_id' => $rol->id, 'role' => 'agricultor'] + $attributes);
    }

    private function diagnostico(User $user, array $attributes = []): Diagnostico
    {
        return Diagnostico::factory()->create($attributes + [
            'usuario_id' => $user->id,
            'captured_at' => '2026-10-15 09:00:00',
            'synced_at' => '2026-10-15 09:30:00',
            'modelo_version' => 'roya-mobilenetv3-small-v1',
        ]);
    }

    public function test_summary_computes_the_three_indicators_from_real_rows(): void
    {
        $tecnico = User::factory()->create();
        $this->diagnostico($tecnico, ['clase' => 'roya_amarilla', 'confianza' => 90, 'severidad' => 20]);
        $this->diagnostico($tecnico, ['clase' => 'roya_amarilla', 'confianza' => 80, 'severidad' => 40]);
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 95, 'severidad' => null]);
        $this->diagnostico($tecnico, ['clase' => 'otra_enfermedad', 'confianza' => 50]); // < 75 => no_concluyente

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.indicadores.total_diagnosticos', 4)
            ->assertJsonPath('data.indicadores.por_clase', [
                'sana' => 1,
                'roya_amarilla' => 2,
                'otra_enfermedad' => 0,
                'no_concluyente' => 1,
            ])
            ->assertJsonPath('data.indicadores.porcentaje_roya', 50)
            ->assertJsonPath('data.indicadores.confianza_promedio', 78.8)
            ->assertJsonPath('data.complementarios.severidad_promedio_roya', 30)
            ->assertJsonPath('data.complementarios.latencia_sync_mediana_min', 30);
    }

    public function test_diagnostics_saved_without_running_the_model_are_excluded_and_reported(): void
    {
        $tecnico = User::factory()->create();
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 96]);
        $this->diagnostico($tecnico, [
            'clase' => 'no_concluyente',
            'confianza' => 33.33,
            'modelo_version' => 'roya-mobilenetv3-small-v1'.ReporteService::SUFIJO_SIN_MODELO,
        ]);

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('data.indicadores.total_diagnosticos', 1)
            ->assertJsonPath('data.calidad_datos.descartados_sin_modelo', 1);
    }

    public function test_demo_data_is_excluded_by_default_and_available_on_request(): void
    {
        $tecnico = User::factory()->create();
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 96]);
        $this->diagnostico($tecnico, ['clase' => 'roya_amarilla', 'confianza' => 91, 'modelo_version' => ReporteService::MODELO_DEMO]);

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/reports/summary')
            ->assertJsonPath('data.filtros.origen', 'campo')
            ->assertJsonPath('data.indicadores.total_diagnosticos', 1)
            ->assertJsonPath('data.indicadores.porcentaje_roya', 0);
        $this->getJson('/api/reports/summary?origen=demo')
            ->assertJsonPath('data.indicadores.total_diagnosticos', 1)
            ->assertJsonPath('data.indicadores.porcentaje_roya', 100);
        $this->getJson('/api/reports/summary?origen=todos')
            ->assertJsonPath('data.indicadores.total_diagnosticos', 2);
    }

    public function test_date_filters_and_monthly_series_without_gaps(): void
    {
        $tecnico = User::factory()->create();
        $this->diagnostico($tecnico, ['clase' => 'roya_amarilla', 'confianza' => 90, 'captured_at' => '2026-08-03 10:00:00', 'synced_at' => null]);
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 90, 'captured_at' => '2026-10-20 10:00:00', 'synced_at' => null]);
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 90, 'captured_at' => '2026-11-02 10:00:00', 'synced_at' => null]);

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/reports/summary')
            ->assertJsonCount(4, 'data.serie_mensual')
            ->assertJsonPath('data.serie_mensual.0', ['mes' => '2026-08', 'total' => 1, 'roya_amarilla' => 1, 'porcentaje_roya' => 100])
            ->assertJsonPath('data.serie_mensual.1', ['mes' => '2026-09', 'total' => 0, 'roya_amarilla' => 0, 'porcentaje_roya' => null])
            ->assertJsonPath('data.complementarios.latencia_sync_mediana_min', null);

        $this->getJson('/api/reports/summary?desde=2026-10-01&hasta=2026-10-31')
            ->assertJsonPath('data.indicadores.total_diagnosticos', 1)
            ->assertJsonPath('data.indicadores.por_clase.sana', 1);
    }

    public function test_inconsistent_sync_dates_are_not_averaged(): void
    {
        $tecnico = User::factory()->create();
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 90, 'captured_at' => '2026-10-15 09:00:00', 'synced_at' => '2026-10-15 09:10:00']);
        $this->diagnostico($tecnico, ['clase' => 'sana', 'confianza' => 90, 'captured_at' => '2026-10-15 09:00:00', 'synced_at' => '2026-10-12 09:00:00']);

        Sanctum::actingAs($tecnico);

        $this->getJson('/api/reports/summary')
            ->assertJsonPath('data.complementarios.latencia_sync_mediana_min', 10)
            ->assertJsonPath('data.calidad_datos.fechas_inconsistentes', 1);
    }

    public function test_agricultor_only_sees_own_data_and_other_tenants_are_isolated(): void
    {
        $agricultor = $this->agricultor();
        $vecino = $this->agricultor(['tenant_id' => $agricultor->tenant_id]);
        $otroTenant = User::factory()->create();
        $this->diagnostico($agricultor, ['clase' => 'roya_amarilla', 'confianza' => 88]);
        $this->diagnostico($vecino, ['clase' => 'sana', 'confianza' => 88]);
        $this->diagnostico($otroTenant, ['clase' => 'sana', 'confianza' => 88]);

        Sanctum::actingAs($agricultor);

        $this->getJson('/api/reports/summary')
            ->assertJsonPath('data.indicadores.total_diagnosticos', 1)
            ->assertJsonPath('data.indicadores.porcentaje_roya', 100);
    }

    public function test_empty_dataset_returns_null_indicators_instead_of_division_by_zero(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('data.indicadores.total_diagnosticos', 0)
            ->assertJsonPath('data.indicadores.porcentaje_roya', null)
            ->assertJsonPath('data.indicadores.confianza_promedio', null)
            ->assertJsonPath('data.serie_mensual', []);
    }

    public function test_invalid_filters_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/reports/summary?desde=2026-11-10&hasta=2026-11-01&origen=inventado')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['hasta', 'origen']);
    }

    public function test_reports_require_authentication(): void
    {
        $this->getJson('/api/reports/summary')->assertUnauthorized();
        $this->getJson('/api/reports/export')->assertUnauthorized();
    }

    public function test_export_streams_a_csv_with_validity_flag(): void
    {
        $tecnico = User::factory()->create();
        $valido = $this->diagnostico($tecnico, ['clase' => 'roya_amarilla', 'confianza' => 92]);
        $this->diagnostico($tecnico, [
            'clase' => 'no_concluyente',
            'confianza' => 33.33,
            'modelo_version' => 'roya-mobilenetv3-small-v1'.ReporteService::SUFIJO_SIN_MODELO,
        ]);

        Sanctum::actingAs($tecnico);

        $response = $this->get('/api/reports/export');
        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('reporte_diagnosticos_', $response->headers->get('Content-Disposition'));

        $lineas = array_values(array_filter(explode("\n", trim($response->streamedContent()))));
        $this->assertCount(3, $lineas);
        $this->assertStringStartsWith("\xEF\xBB\xBFuuid_local;fecha_captura;clase", $lineas[0]);
        $this->assertStringContainsString($valido->uuid_local.';', $lineas[1]);
        $this->assertStringEndsWith(';si', $lineas[1]);
        $this->assertStringEndsWith(';no', $lineas[2]);
    }

    public function test_reports_web_route_serves_the_spa_for_authenticated_users(): void
    {
        $this->get('/reports')->assertRedirect('/login');

        $this->actingAs(User::factory()->create())
            ->get('/reports')
            ->assertOk()
            ->assertSee('id="app"', false);
    }
}
