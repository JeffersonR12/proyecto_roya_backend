<?php

namespace App\Support;

class Risk
{
    public static function level(float $confidence): string
    {
        if ($confidence > 0.3) {
            return 'critical';
        }

        if ($confidence >= 0.1) {
            return 'medium';
        }

        return 'healthy';
    }

    public static function label(string $level): string
    {
        return match ($level) {
            'critical' => 'CRITICO',
            'medium' => 'ALERTA MEDIA',
            default => 'SANO',
        };
    }

    public static function recommendation(string $level): string
    {
        return match ($level) {
            'critical' => 'Cuarentena inmediata y aplicacion de fungicida sistemico',
            'medium' => 'Reinspeccionar en 48 horas y vigilar humedad',
            default => 'Mantener plan preventivo',
        };
    }

    public static function present(float $confidence): array
    {
        $level = self::level($confidence);

        return [
            'level' => $level,
            'label' => self::label($level),
            'severity' => (int) round($confidence * 100),
            'recommendation' => self::recommendation($level),
        ];
    }
}
