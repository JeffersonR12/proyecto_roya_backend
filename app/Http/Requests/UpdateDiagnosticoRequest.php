<?php

namespace App\Http\Requests;

use App\Models\Diagnostico;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * PATCH /api/diagnosticos/{uuid}: correccion y validacion tecnica (HITL).
 * El rol se controla con el middleware role:tecnico,administrador.
 */
class UpdateDiagnosticoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hitl_status' => ['sometimes', Rule::in(['pending', 'validated', 'rejected', 'resample'])],
            'etiqueta_humana' => ['sometimes', 'nullable', Rule::in(Diagnostico::CLASES)],
            'severidad' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ];
    }
}
