<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'image_base64' => ['required', 'string', 'max:8000000'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'image_base64.required' => 'La imagen es obligatoria.',
            'image_base64.max' => 'La imagen no debe superar los 5 MB.',
            'location.max' => 'La ubicacion no debe superar los 255 caracteres.',
        ];
    }
}
