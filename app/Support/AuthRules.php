<?php

namespace App\Support;

class AuthRules
{
    public const GMAIL_PATTERN = '/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const GMAIL_REGEX = 'regex:/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const REMEMBER_MINUTES = 43200;

    public const LOGIN_ATTEMPTS = 5;

    public const LOGIN_DECAY_SECONDS = 60;

    public const PERU_PHONE_PATTERN = '/^\+519[0-9]{8}$/';

    public const PERU_PHONE_REGEX = 'regex:/^\+519[0-9]{8}$/';

    public static function normalizePeruPhone(?string $raw): string
    {
        $digits = preg_replace('/\D+/', '', (string) $raw) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '51') && strlen($digits) >= 11) {
            $digits = substr($digits, 2);
        }

        return '+51'.$digits;
    }
}
