<?php

namespace App\Services;

use App\Models\Diagnostico;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Indicadores de vigilancia de Roya Amarilla calculados en vivo sobre la tabla diagnosticos.
 *
 * Calidad de datos:
 *  - Los diagnosticos guardados sin ejecutar la CNN (modelo_version "...+sin-pesos", ver DEF-01/02)
 *    no son validos: se excluyen de los indicadores y se informan aparte.
 *  - Los datos sinteticos de DiagnosticoDemoSeeder (modelo_version = MODELO_DEMO) solo se incluyen
 *    si se piden explicitamente (origen = demo | todos); por defecto se reportan datos de campo.
 *  - La latencia de sincronizacion ignora registros con synced_at anterior a captured_at.
 */
class ReporteService
{
    public const MODELO_DEMO = 'demo-seeder-v1';

    public const SUFIJO_SIN_MODELO = '+sin-pesos';

    public const ORIGENES = ['campo', 'demo', 'todos'];

    /** Diagnosticos visibles para el usuario (tenant + rol) con filtros de fecha y origen. */
    public function consulta(User $user, array $filtros): Builder
    {
        $query = Diagnostico::query()
            ->visiblePara($user)
            ->when($filtros['desde'] ?? null, fn (Builder $q, string $desde) => $q->where('captured_at', '>=', CarbonImmutable::parse($desde)->startOfDay()))
            ->when($filtros['hasta'] ?? null, fn (Builder $q, string $hasta) => $q->where('captured_at', '<=', CarbonImmutable::parse($hasta)->endOfDay()));

        return match ($filtros['origen'] ?? 'campo') {
            'demo' => $query->where('modelo_version', self::MODELO_DEMO),
            'todos' => $query,
            default => $query->where('modelo_version', '!=', self::MODELO_DEMO),
        };
    }

    public function resumen(User $user, array $filtros): array
    {
        $base = $this->consulta($user, $filtros);
        $validos = (clone $base)->where('modelo_version', 'not like', '%'.self::SUFIJO_SIN_MODELO);

        $porClase = $this->conteoPorClase($validos);
        $total = array_sum($porClase);
        $roya = $porClase['roya_amarilla'];

        $filas = (clone $validos)->get(['clase', 'confianza', 'severidad', 'hitl_status', 'captured_at', 'synced_at']);
        $latencias = $this->latenciasSincronizacion($filas);

        return [
            'filtros' => [
                'desde' => $filtros['desde'] ?? null,
                'hasta' => $filtros['hasta'] ?? null,
                'origen' => $filtros['origen'] ?? 'campo',
            ],
            'indicadores' => [
                'total_diagnosticos' => $total,
                'por_clase' => $porClase,
                'porcentaje_roya' => $total > 0 ? round($roya * 100 / $total, 1) : null,
                'confianza_promedio' => $this->promedio($filas->pluck('confianza')),
            ],
            'complementarios' => [
                'severidad_promedio_roya' => $this->promedio($filas->where('clase', 'roya_amarilla')->pluck('severidad')->filter(fn ($v) => $v !== null)),
                'hitl_validados' => $filas->where('hitl_status', 'validated')->count(),
                'hitl_pendientes' => $filas->where('hitl_status', 'pending')->count(),
                'latencia_sync_mediana_min' => $latencias['mediana_min'],
            ],
            'calidad_datos' => [
                'descartados_sin_modelo' => (clone $base)->where('modelo_version', 'like', '%'.self::SUFIJO_SIN_MODELO)->count(),
                'fechas_inconsistentes' => $latencias['inconsistentes'],
            ],
            'serie_mensual' => $this->serieMensual($filas),
        ];
    }

    /** @return array<string,int> conteo por cada clase de Diagnostico::CLASES (0 si no hay). */
    private function conteoPorClase(Builder $query): array
    {
        $conteo = (clone $query)
            ->selectRaw('clase, COUNT(*) as total')
            ->groupBy('clase')
            ->pluck('total', 'clase');

        return collect(Diagnostico::CLASES)
            ->mapWithKeys(fn (string $clase) => [$clase => (int) ($conteo[$clase] ?? 0)])
            ->all();
    }

    private function promedio(Collection $valores): ?float
    {
        return $valores->isEmpty() ? null : round((float) $valores->avg(), 1);
    }

    /** @return array{mediana_min: float|null, inconsistentes: int} */
    private function latenciasSincronizacion(Collection $filas): array
    {
        $sincronizadas = $filas->filter(fn ($fila) => $fila->synced_at !== null);
        $minutos = $sincronizadas
            ->map(fn ($fila) => $fila->captured_at->diffInSeconds($fila->synced_at, false) / 60)
            ->filter(fn (float $min) => $min >= 0)
            ->sort()
            ->values();

        $mediana = null;
        if ($minutos->isNotEmpty()) {
            $mitad = intdiv($minutos->count(), 2);
            $mediana = $minutos->count() % 2 === 1
                ? $minutos[$mitad]
                : ($minutos[$mitad - 1] + $minutos[$mitad]) / 2;
            $mediana = round($mediana, 1);
        }

        return [
            'mediana_min' => $mediana,
            'inconsistentes' => $sincronizadas->count() - $minutos->count(),
        ];
    }

    /** Total y casos de roya por mes (YYYY-MM), sin huecos entre el primer y el último mes. */
    private function serieMensual(Collection $filas): array
    {
        if ($filas->isEmpty()) {
            return [];
        }

        $porMes = $filas->groupBy(fn ($fila) => $fila->captured_at->format('Y-m'));
        $mes = CarbonImmutable::parse($porMes->keys()->min().'-01');
        $fin = CarbonImmutable::parse($porMes->keys()->max().'-01');
        $serie = [];

        while ($mes <= $fin) {
            $clave = $mes->format('Y-m');
            $delMes = $porMes->get($clave, collect());
            $total = $delMes->count();
            $roya = $delMes->where('clase', 'roya_amarilla')->count();

            $serie[] = [
                'mes' => $clave,
                'total' => $total,
                'roya_amarilla' => $roya,
                'porcentaje_roya' => $total > 0 ? round($roya * 100 / $total, 1) : null,
            ];
            $mes = $mes->addMonth();
        }

        return $serie;
    }
}
