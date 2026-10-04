<?php

namespace App\Support;

class SimulatedInspection
{
    public const DISEASE = 'Roya Amarilla';

    public const SAMPLES = [5, 8, 14, 22, 36, 49, 67, 82];

    public static function confidence(): float
    {
        $severity = self::SAMPLES[random_int(0, count(self::SAMPLES) - 1)];

        return $severity / 100;
    }
}
