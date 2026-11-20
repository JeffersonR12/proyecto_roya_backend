<?php

namespace Database\Seeders;

use App\Models\Alerta;
use App\Models\Diagnostico;
use App\Models\Parcela;
use App\Models\Tenant;
use App\Models\User;
use App\Services\ReporteService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * 40 diagnosticos SINTETICOS de demostracion (ultimos 6 meses) para ilustrar el modulo de reportes.
 *
 * - Se marcan con modelo_version = ReporteService::MODELO_DEMO: el reporte los excluye por defecto
 *   (origen=campo) y solo los muestra con origen=demo|todos. Nunca se mezclan con datos de campo.
 * - Deterministico (semilla fija) e idempotente: borra sus propios registros antes de crearlos.
 *
 * Uso (PowerShell):
 *   php artisan db:seed --class=DiagnosticoDemoSeeder                     # tenant el-roble
 *   $env:DEMO_TENANT_CODIGO="otro-tenant"; php artisan db:seed --class=DiagnosticoDemoSeeder
 *   $env:DEMO_SEED_REVERT="1"; php artisan db:seed --class=DiagnosticoDemoSeeder   # solo elimina
 */
class DiagnosticoDemoSeeder extends Seeder
{
    private const SEMILLA = 20261110;

    /** Capturas por mes (del más antiguo al actual) y probabilidad de roya: incidencia creciente. */
    private const CAPTURAS_POR_MES = [5, 6, 6, 7, 8, 8];

    private const PROB_ROYA_POR_MES = [0.10, 0.15, 0.20, 0.30, 0.40, 0.45];

    public function run(): void
    {
        $codigo = getenv('DEMO_TENANT_CODIGO') ?: 'el-roble';
        $tenant = Tenant::query()->where('codigo', $codigo)->first()
            ?? throw new RuntimeException("No existe el tenant '{$codigo}'. Ejecuta antes: php artisan db:seed");

        $eliminados = $this->eliminarDemo($tenant);

        if (getenv('DEMO_SEED_REVERT')) {
            $this->command?->info("Datos demo eliminados del tenant {$codigo}: {$eliminados}.");

            return;
        }

        $usuarios = User::query()->where('tenant_id', $tenant->id)->pluck('id')->all();
        if ($usuarios === []) {
            throw new RuntimeException("El tenant '{$codigo}' no tiene usuarios.");
        }
        $parcelas = Parcela::query()->where('tenant_id', $tenant->id)->pluck('id')->all();

        mt_srand(self::SEMILLA);
        $creados = 0;
        $hoy = Carbon::now();

        foreach (self::CAPTURAS_POR_MES as $indice => $cantidad) {
            $mes = $hoy->copy()->startOfMonth()->subMonths(count(self::CAPTURAS_POR_MES) - 1 - $indice);

            for ($i = 0; $i < $cantidad; $i++) {
                $this->crear($tenant->id, $usuarios, $parcelas, $mes, $indice, $hoy);
                $creados++;
            }
        }

        $this->command?->info("Tenant {$codigo}: {$eliminados} demo previos eliminados, {$creados} creados (".ReporteService::MODELO_DEMO.').');
    }

    private function eliminarDemo(Tenant $tenant): int
    {
        $ids = Diagnostico::withTrashed()
            ->where('tenant_id', $tenant->id)
            ->where('modelo_version', ReporteService::MODELO_DEMO)
            ->pluck('id');

        DB::transaction(function () use ($ids): void {
            Alerta::query()->whereIn('diagnostico_id', $ids)->delete();
            Diagnostico::withTrashed()->whereIn('id', $ids)->forceDelete();
        });

        return $ids->count();
    }

    private function crear(int $tenantId, array $usuarios, array $parcelas, Carbon $mes, int $indiceMes, Carbon $hoy): void
    {
        $clase = $this->clase(self::PROB_ROYA_POR_MES[$indiceMes]);
        $confianza = match ($clase) {
            'roya_amarilla' => $this->entre(76, 97),
            'sana' => $this->entre(80, 99),
            'otra_enfermedad' => $this->entre(75, 92),
            default => $this->entre(35, 74),
        };

        $ultimoDia = $mes->isSameMonth($hoy) ? max(1, $hoy->day - 1) : $mes->daysInMonth;
        $capturado = $mes->copy()->day(mt_rand(1, $ultimoDia))->setTime(mt_rand(7, 16), mt_rand(0, 59));
        $revisado = $clase !== 'sana' && $indiceMes <= 3 && mt_rand(1, 10) <= 8;

        Diagnostico::query()->create([
            'tenant_id' => $tenantId,
            'usuario_id' => $usuarios[array_rand($usuarios)],
            'parcela_id' => $parcelas === [] ? null : $parcelas[array_rand($parcelas)],
            'clase' => $clase,
            'confianza' => $confianza,
            // Severidad (% de area foliar afectada) creciente con el avance de la temporada.
            'severidad' => $clase === 'roya_amarilla' ? min(95, 5 + $indiceMes * 6 + $this->entre(0, 15)) : null,
            'scores' => $this->scores($clase, $confianza),
            'latitud' => -11.79 + $this->entre(-20, 20) / 1000,
            'longitud' => -75.50 + $this->entre(-20, 20) / 1000,
            'imagen_path' => null,
            'modelo_version' => ReporteService::MODELO_DEMO,
            'captured_at' => $capturado,
            // Campo sin señal: se sincroniza entre 5 minutos y 10 horas despues de la captura.
            'synced_at' => $capturado->copy()->addMinutes(mt_rand(5, 600)),
            'sync_status' => 'confirmed',
            'hitl_status' => $clase === 'sana' ? 'not_required' : ($revisado ? 'validated' : 'pending'),
            'etiqueta_humana' => $revisado ? $clase : null,
        ]);
    }

    private function clase(float $probRoya): string
    {
        $r = mt_rand() / mt_getrandmax();

        return match (true) {
            $r < $probRoya => 'roya_amarilla',
            $r < $probRoya + 0.12 => 'otra_enfermedad',
            $r < $probRoya + 0.25 => 'no_concluyente',
            default => 'sana',
        };
    }

    private function entre(int $min, int $max): float
    {
        return round($min + (mt_rand() / mt_getrandmax()) * ($max - $min), 2);
    }

    /** @return array<string,float> probabilidades coherentes con la clase y la confianza (suman 100). */
    private function scores(string $clase, float $confianza): array
    {
        $principal = $clase === 'no_concluyente' ? 'sana' : $clase;
        $resto = round((100 - $confianza) / 2, 2);

        return collect(['sana', 'roya_amarilla', 'otra_enfermedad'])
            ->mapWithKeys(fn (string $c) => [$c => $c === $principal ? $confianza : $resto])
            ->all();
    }
}
