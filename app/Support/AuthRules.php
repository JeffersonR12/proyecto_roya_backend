<?php

namespace App\Support;

use Illuminate\Validation\Rules\Password;

class AuthRules
{
    public const GMAIL_PATTERN = '/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const GMAIL_REGEX = 'regex:/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const REMEMBER_MINUTES = 43200;

    public const LOGIN_ATTEMPTS = 5;

    public const LOGIN_DECAY_SECONDS = 60;

    public static function password(): Password
    {
        return Password::min(8)->letters()->mixedCase()->numbers();
    }

    public static function passwordMessages(): array
    {
        return [
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.letters' => 'La contraseña debe incluir letras.',
            'password.mixed' => 'La contraseña debe incluir mayusculas y minusculas.',
            'password.numbers' => 'La contraseña debe incluir al menos un numero.',
        ];
    }
}
