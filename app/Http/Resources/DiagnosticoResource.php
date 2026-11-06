<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Diagnostico */
class DiagnosticoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid_local' => $this->uuid_local,
            'clase' => $this->clase,
            'confianza' => (float) $this->confianza,
            'severidad' => $this->severidad === null ? null : (float) $this->severidad,
            'scores' => $this->scores,
            'latitud' => $this->latitud === null ? null : (float) $this->latitud,
            'longitud' => $this->longitud === null ? null : (float) $this->longitud,
            'modelo_version' => $this->modelo_version,
            'captured_at' => $this->captured_at?->toIso8601String(),
            'synced_at' => $this->synced_at?->toIso8601String(),
            'sync_status' => $this->sync_status,
            'hitl_status' => $this->hitl_status,
            'etiqueta_humana' => $this->etiqueta_humana,
            'parcela' => $this->whenLoaded('parcela', fn () => $this->parcela ? [
                'id' => $this->parcela->id,
                'nombre' => $this->parcela->nombre,
            ] : null),
            'usuario' => $this->whenLoaded('usuario', fn () => $this->usuario ? [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
            ] : null),
            'catalogo' => $this->whenLoaded('catalogo', fn () => $this->catalogo ? [
                'codigo' => $this->catalogo->codigo,
                'nombre' => $this->catalogo->nombre,
                'umbral_alerta' => (float) $this->catalogo->umbral_alerta,
            ] : null),
            'imagen_url' => $this->imagen_path
                ? route('api.diagnosticos.imagen', ['uuid' => $this->uuid_local], false)
                : null,
        ];
    }
}
