<?php

namespace App\Http\Requests;

use App\Models\Diagnostico;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Contrato POST /api/sync/diagnosticos (Docs/09 §4).
 */
class SyncDiagnosticosRequest extends FormRequest
{
    public const MAX_ITEMS = 50;

    /** base64 de 2 MB + cabecera del data URL. */
    public const MAX_IMAGEN_CHARS = 2_900_000;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1', 'max:'.self::MAX_ITEMS],
            'items.*.uuid_local' => ['required', 'uuid', 'distinct:ignore_case'],
            'items.*.clase' => ['required', Rule::in(Diagnostico::CLASES)],
            'items.*.confianza' => ['required', 'numeric', 'between:0,100'],
            'items.*.severidad' => ['nullable', 'numeric', 'between:0,100'],
            'items.*.scores' => ['nullable', 'array'],
            'items.*.scores.*' => ['numeric', 'between:0,100'],
            'items.*.modelo_version' => ['required', 'string', 'max:50'],
            'items.*.captured_at' => ['required', 'date'],
            'items.*.latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'items.*.longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'items.*.parcela_id' => ['nullable', 'integer', 'min:1'],
            'items.*.parcela_nombre' => ['nullable', 'string', 'max:100'],
            'items.*.hitl_status' => ['nullable', Rule::in(Diagnostico::HITL_STATUSES)],
            'items.*.etiqueta_humana' => ['nullable', Rule::in(Diagnostico::CLASES)],
            'items.*.imagen_base64' => ['nullable', 'string', 'max:'.self::MAX_IMAGEN_CHARS],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Envia al menos un diagnostico.',
            'items.max' => 'Maximo '.self::MAX_ITEMS.' diagnosticos por lote.',
            'items.*.uuid_local.distinct' => 'El lote contiene uuid_local repetidos.',
            'items.*.modelo_version.required' => 'modelo_version es obligatorio para diagnosticos del Edge.',
            'items.*.confianza.between' => 'La confianza debe estar entre 0 y 100.',
            'items.*.severidad.between' => 'La severidad debe estar entre 0 y 100.',
        ];
    }
}
