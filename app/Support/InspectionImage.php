<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InspectionImage
{
    public const MAX_BYTES = 5 * 1024 * 1024;

    private const MIME_EXTENSION = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public static function store(string $dataUrl, int $userId): string
    {
        $binary = self::decode($dataUrl);
        $extension = self::MIME_EXTENSION[self::mime($binary)];
        $path = 'analyses/'.$userId.'/'.Str::uuid().'.'.$extension;

        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    private static function decode(string $dataUrl): string
    {
        if (! preg_match('#^data:image/(jpeg|jpg|png|webp);base64,#i', $dataUrl)) {
            throw self::invalid('La imagen debe ser JPG, PNG o WEBP.');
        }

        $parts = explode(',', $dataUrl, 2);
        $binary = base64_decode($parts[1] ?? '', true);

        if ($binary === false || $binary === '') {
            throw self::invalid('La imagen no se pudo leer.');
        }

        if (strlen($binary) > self::MAX_BYTES) {
            throw self::invalid('La imagen no debe superar los 5 MB.');
        }

        return $binary;
    }

    private static function mime(string $binary): string
    {
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($binary) ?: '';

        if (! isset(self::MIME_EXTENSION[$mime])) {
            throw self::invalid('Solo se permiten imagenes JPG, PNG o WEBP.');
        }

        if (@getimagesizefromstring($binary) === false && $mime !== 'image/webp') {
            throw self::invalid('El archivo debe ser una imagen valida.');
        }

        return $mime;
    }

    private static function invalid(string $message): ValidationException
    {
        return ValidationException::withMessages([
            'image_base64' => $message,
        ]);
    }
}
