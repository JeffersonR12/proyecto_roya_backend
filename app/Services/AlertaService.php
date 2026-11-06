<?php

namespace App\Services;

use App\Models\Alerta;
use App\Models\Diagnostico;

/**
 * Reglas de alerta temprana (Docs/09 §7).
 *
 * - Roya amarilla afirmada (confianza >= umbral) => alerta "roya_detectada".
 * - Si ademas la severidad foliar alcanza el umbral del catalogo => "roya_critica".
 * - Un diagnostico rechazado por HITL o no concluyente nunca genera alerta de roya.
 * - Una sola alerta por diagnostico; se actualiza si cambia la severidad.
 */
class AlertaService
{
    public function evaluar(Diagnostico $diagnostico): ?Alerta
    {
        $tipo = $this->tipoPara($diagnostico);
        $existente = Alerta::query()
            ->withoutGlobalScopes()
            ->where('diagnostico_id', $diagnostico->id)
            ->first();

        if (! $tipo) {
            // Rechazada por HITL tras haber alertado: se descarta, no se borra (auditoria).
            if ($existente && $existente->tipo !== 'descartada') {
                $existente->fill(['tipo' => 'descartada', 'leida' => true])->save();
            }

            return null;
        }

        $datos = [
            'tenant_id' => $diagnostico->tenant_id,
            'usuario_id' => $diagnostico->usuario_id,
            'tipo' => $tipo,
            'mensaje' => $this->mensaje($diagnostico, $tipo),
        ];

        if ($existente) {
            if ($existente->tipo !== $tipo) {
                $existente->fill($datos + ['leida' => false])->save();
            }

            return $existente;
        }

        return Alerta::query()->create($datos + [
            'diagnostico_id' => $diagnostico->id,
            'leida' => false,
        ]);
    }

    public function tipoPara(Diagnostico $diagnostico): ?string
    {
        if ($diagnostico->clase !== 'roya_amarilla'
            || (float) $diagnostico->confianza < Diagnostico::UMBRAL_CONFIANZA
            || $diagnostico->hitl_status === 'rejected') {
            return null;
        }

        $umbral = $diagnostico->catalogo?->umbral_alerta;

        if ($diagnostico->severidad !== null && $umbral !== null
            && (float) $diagnostico->severidad >= (float) $umbral) {
            return 'roya_critica';
        }

        return 'roya_detectada';
    }

    private function mensaje(Diagnostico $diagnostico, string $tipo): string
    {
        $lote = $diagnostico->parcela?->nombre ?? 'sin lote';
        $confianza = number_format((float) $diagnostico->confianza, 1);

        if ($tipo === 'roya_critica') {
            $severidad = number_format((float) $diagnostico->severidad, 1);
            $umbral = number_format((float) $diagnostico->catalogo?->umbral_alerta, 0);

            return "Roya amarilla en {$lote}: severidad foliar {$severidad}% supera el umbral {$umbral}%. Requiere validacion tecnica antes de tratar.";
        }

        return "Posible roya amarilla en {$lote} (confianza {$confianza}%). Pendiente de validacion tecnica.";
    }
}
