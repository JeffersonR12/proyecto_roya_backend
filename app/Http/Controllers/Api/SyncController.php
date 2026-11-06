<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncDiagnosticosRequest;
use App\Models\Diagnostico;
use App\Models\SyncEvent;
use App\Services\DiagnosticoSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __construct(private readonly DiagnosticoSyncService $sync) {}

    /** POST /api/sync/diagnosticos: lote transaccional e idempotente por uuid_local. */
    public function store(SyncDiagnosticosRequest $request): JsonResponse
    {
        $resultado = $this->sync->sincronizar($request->user(), $request->validated('items'));

        return response()->json([
            'success' => true,
            'message' => "Procesados {$resultado['processed']} diagnosticos.",
            'data' => $resultado,
        ]);
    }

    /** GET /api/sync/status: estado de la nube para el usuario autenticado. */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $visibles = Diagnostico::query()->visiblePara($user);

        $eventos = SyncEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('updated_at', '>=', now()->subDay())
            ->selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        return response()->json([
            'success' => true,
            'data' => [
                'diagnosticos_en_nube' => (clone $visibles)->count(),
                'ultima_sincronizacion' => (clone $visibles)->max('synced_at'),
                'eventos_24h' => $eventos,
                'servidor' => now()->toIso8601String(),
            ],
        ]);
    }
}
