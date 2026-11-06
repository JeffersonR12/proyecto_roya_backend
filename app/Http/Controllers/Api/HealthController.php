<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * GET /api/health: estado de base de datos y del artefacto ONNX (rules.md §9).
 * No expone datos de tenants ni secretos.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $database = 'ok';
        } catch (Throwable) {
            $database = 'error';
        }

        $modelo = public_path('models/modelo_roya.onnx');
        $healthy = $database === 'ok';

        return response()->json([
            'success' => $healthy,
            'data' => [
                'status' => $healthy ? 'ok' : 'degraded',
                'database' => $database,
                'modelo_onnx' => is_file($modelo) ? 'presente' : 'ausente',
                'time' => now()->toIso8601String(),
            ],
        ], $healthy ? 200 : 503);
    }
}
