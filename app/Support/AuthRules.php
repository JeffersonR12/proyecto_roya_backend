<?php

namespace App\Support;

class AuthRules
{
    public const GMAIL_PATTERN = '/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const GMAIL_REGEX = 'regex:/^[a-zA-Z0-9._%+-]+@gmail\.com$/';

    public const REMEMBER_MINUTES = 43200;

    public const LOGIN_ATTEMPTS = 5;

    public const LOGIN_DECAY_SECONDS = 60;
}
