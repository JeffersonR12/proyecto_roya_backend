<?php

namespace App\Http\Requests;

use App\Models\Tenant;
use App\Support\AuthRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Registro publico. No acepta rol ni nombre de organizacion: el rol es
 * siempre agricultor y la cooperativa sale del codigo de invitacion que
 * entrega su administrador (OWASP A01, control de acceso roto).
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'phone' => AuthRules::normalizePeruPhone($this->input('phone')),
            'codigo_invitacion' => Tenant::normalizarCodigoInvitacion($this->input('codigo_invitacion')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'max:255', 'unique:users,email', AuthRules::GMAIL_REGEX],
            'phone' => ['required', 'string', 'max:16', AuthRules::PERU_PHONE_REGEX],
            'codigo_invitacion' => [
                'required',
                'string',
                'max:12',
                Rule::exists('tenants', 'codigo_invitacion')->where('activo', true),
            ],
            'password' => ['required', 'confirmed', Password::min(8)],
            'terms' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.regex' => 'El correo debe tener el formato usuario@gmail.com.',
            'email.unique' => 'Este correo ya esta registrado.',
            'phone.required' => 'El celular peruano es obligatorio.',
            'phone.regex' => 'Ingresa un celular peruano: +51 9 seguido de 8 digitos.',
            'codigo_invitacion.required' => 'Ingresa el código de tu cooperativa.',
            'codigo_invitacion.max' => 'El código de cooperativa no es válido o la cooperativa no está activa. Pídelo de nuevo a tu administrador.',
            'codigo_invitacion.exists' => 'El código de cooperativa no es válido o la cooperativa no está activa. Pídelo de nuevo a tu administrador.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'terms.accepted' => 'Debes aceptar los terminos de uso.',
        ];
    }
}
