<?php

namespace App\Http\Requests;

use App\Support\AuthRules;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'password' => (string) $this->input('password'),
            'remember_me' => $this->boolean('remember_me'),
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255', AuthRules::GMAIL_REGEX],
            'password' => ['required', 'string'],
            'remember_me' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo es obligatorio.',
            'email.regex' => 'El correo debe tener el formato usuario@gmail.com.',
            'password.required' => 'La contraseña es obligatoria.',
        ];
    }
}
