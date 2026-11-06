<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerta;
use App\Models\CatalogoFitosanitario;
use App\Models\Parcela;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Consultas de solo lectura: catalogo, parcelas y alertas (Docs/09 §3).
 */
class ConsultaController extends Controller
{
    public function catalogo(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CatalogoFitosanitario::query()
                ->where('activo', true)
                ->orderBy('codigo')
                ->get(['id', 'codigo', 'nombre', 'agente_causal', 'cultivo', 'sintomas', 'recomendaciones', 'severidad_base', 'umbral_alerta']),
        ]);
    }

    public function parcelas(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => Parcela::query()
                ->where('tenant_id', $user->tenant_id)
                ->when(! $user->isStaff(), fn ($q) => $q->where('usuario_id', $user->id))
                ->withCount('diagnosticos')
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'latitud', 'longitud', 'area_hectareas', 'cultivo', 'usuario_id']),
        ]);
    }

    public function alertas(Request $request): JsonResponse
    {
        $user = $request->user();
        $soloNoLeidas = $request->boolean('no_leidas');

        $alertas = Alerta::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('tipo', '!=', 'descartada')
            ->when(! $user->isStaff(), fn ($q) => $q->where('usuario_id', $user->id))
            ->when($soloNoLeidas, fn ($q) => $q->where('leida', false))
            ->with('diagnostico:id,uuid_local,clase,confianza,severidad,parcela_id')
            ->latest()
            ->limit(100)
            ->get();

        return response()->json(['success' => true, 'data' => $alertas]);
    }

    public function marcarAlertaLeida(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $alerta = Alerta::query()
            ->where('tenant_id', $user->tenant_id)
            ->when(! $user->isStaff(), fn ($q) => $q->where('usuario_id', $user->id))
            ->findOrFail($id);

        $alerta->forceFill(['leida' => true])->save();

        return response()->json(['success' => true, 'message' => 'Alerta marcada como leida.', 'data' => $alerta]);
    }
}
