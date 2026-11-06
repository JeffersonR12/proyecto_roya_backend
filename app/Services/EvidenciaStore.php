<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

/**
 * Guarda la miniatura enviada por el Edge (data URL) en el disco privado.
 * Valida MIME real (no el declarado) y tamano antes de escribir (rules.md §3, ISO 27001).
 */
class EvidenciaStore
{
    public const MAX_BYTES = 2 * 1024 * 1024;

    public const MIME_EXTENSION = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public const DISK = 'local';

    public function guardarDataUrl(string $dataUrl, int $tenantId, string $uuid): string
    {
        if (! preg_match('/^data:image\/(jpeg|png|webp);base64,(.+)$/s', $dataUrl, $matches)) {
            throw new InvalidArgumentException('La imagen debe ser un data URL JPEG, PNG o WebP.');
        }

        $bytes = base64_decode($matches[2], true);

        if ($bytes === false || $bytes === '') {
            throw new InvalidArgumentException('La imagen no es base64 valido.');
        }

        if (strlen($bytes) > self::MAX_BYTES) {
            throw new InvalidArgumentException('La imagen supera el tamano maximo de 2 MB.');
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        $extension = self::MIME_EXTENSION[$mime] ?? null;

        if (! $extension) {
            throw new InvalidArgumentException('El contenido de la imagen no es JPEG, PNG ni WebP.');
        }

        $path = "diagnosticos/{$tenantId}/{$uuid}.{$extension}";
        Storage::disk(self::DISK)->put($path, $bytes);

        return $path;
    }
}
