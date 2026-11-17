<?php

namespace App\Http\Requests;

use App\Models\Diagnostico;
use App\Services\ImageStore;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class SyncDiagnosticosRequest extends FormRequest
{
    public const MAX_LOTE = 50;

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'diagnosticos' => ['required', 'array', 'min:1', 'max:'.self::MAX_LOTE],
            'diagnosticos.*.uuid_local' => ['required', 'uuid', 'distinct'],
            'diagnosticos.*.clase' => ['required', Rule::in(Diagnostico::CLASES)],
            'diagnosticos.*.confianza' => ['required', 'numeric', 'between:0,100'],
            'diagnosticos.*.severidad' => ['nullable', 'numeric', 'between:0,100'],
            'diagnosticos.*.latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'diagnosticos.*.longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'diagnosticos.*.modelo_version' => ['required', 'string', 'max:50'],
            'diagnosticos.*.captured_at' => ['required', 'date'],
            'diagnosticos.*.ubicacion' => ['nullable', 'string', 'max:255'],
            'diagnosticos.*.hitl_status' => ['nullable', Rule::in(Diagnostico::HITL_ESTADOS)],
            'diagnosticos.*.etiqueta_humana' => ['nullable', Rule::in(Diagnostico::CLASES)],
            'diagnosticos.*.imagen' => ['required', 'string', $this->imagenValida()],
        ];
    }

    public function messages(): array
    {
        return [
            'diagnosticos.max' => 'Un lote admite como maximo '.self::MAX_LOTE.' diagnosticos.',
            'diagnosticos.*.uuid_local.distinct' => 'El lote repite un uuid_local.',
            'diagnosticos.*.clase.in' => 'La clase no es valida.',
        ];
    }

    private function imagenValida(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_string($value)) {
                return;
            }

            try {
                app(ImageStore::class)->decode($value);
            } catch (InvalidArgumentException $exception) {
                $fail($exception->getMessage());
            }
        };
    }
}
