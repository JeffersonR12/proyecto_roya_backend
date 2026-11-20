<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFilterRequest;
use App\Services\ReporteService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Modulo de reportes: indicadores de vigilancia de Roya Amarilla y exportacion CSV.
 * Los datos respetan tenant y rol (Diagnostico::visiblePara).
 */
class ReportController extends Controller
{
    private const COLUMNAS_CSV = [
        'uuid_local', 'fecha_captura', 'clase', 'confianza', 'severidad', 'hitl_status',
        'etiqueta_humana', 'parcela', 'modelo_version', 'sync_status', 'fecha_sincronizacion', 'valido',
    ];

    public function __construct(private readonly ReporteService $reportes) {}

    public function summary(ReportFilterRequest $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->reportes->resumen($request->user(), $request->validated()),
        ]);
    }

    public function export(ReportFilterRequest $request): StreamedResponse
    {
        $query = $this->reportes->consulta($request->user(), $request->validated())
            ->with('parcela:id,nombre')
            ->orderBy('captured_at');

        $archivo = 'reporte_diagnosticos_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $salida = fopen('php://output', 'w');
            // BOM UTF-8 y ';' como separador: Excel en español abre el archivo sin asistente.
            fwrite($salida, "\xEF\xBB\xBF");
            fputcsv($salida, self::COLUMNAS_CSV, ';');

            foreach ($query->lazy(200) as $diagnostico) {
                fputcsv($salida, [
                    $diagnostico->uuid_local,
                    $diagnostico->captured_at?->format('Y-m-d H:i:s'),
                    $diagnostico->clase,
                    $diagnostico->confianza,
                    $diagnostico->severidad,
                    $diagnostico->hitl_status,
                    $diagnostico->etiqueta_humana,
                    $diagnostico->parcela?->nombre,
                    $diagnostico->modelo_version,
                    $diagnostico->sync_status,
                    $diagnostico->synced_at?->format('Y-m-d H:i:s'),
                    str_ends_with((string) $diagnostico->modelo_version, ReporteService::SUFIJO_SIN_MODELO) ? 'no' : 'si',
                ], ';');
            }

            fclose($salida);
        }, $archivo, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
