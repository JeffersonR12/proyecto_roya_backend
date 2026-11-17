<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

/**
 * Guarda las imagenes de diagnostico que llegan en base64 desde la PWA.
 * Se almacenan en el disco privado (storage/app/private), nunca en public.
 */
class ImageStore
{
    public const MAX_BYTES = 5 * 1024 * 1024;

    public const EXTENSIONES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(private readonly string $disk = 'local') {}

    /**
     * Valida la imagen sin guardarla. Devuelve [bytes, extension].
     *
     * @return array{0: string, 1: string}
     */
    public function decode(string $base64): array
    {
        $payload = preg_replace('#^data:[\w/+.-]+;base64,#', '', trim($base64));

        // Tamano maximo aproximado antes de decodificar, para no reservar memoria de mas.
        if (strlen($payload) > (int) ceil(self::MAX_BYTES * 4 / 3) + 4) {
            throw new InvalidArgumentException('La imagen supera 5 MB.');
        }

        $bytes = base64_decode($payload, true);

        if ($bytes === false || $bytes === '') {
            throw new InvalidArgumentException('La imagen no es base64 valido.');
        }

        if (strlen($bytes) > self::MAX_BYTES) {
            throw new InvalidArgumentException('La imagen supera 5 MB.');
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);

        if (! isset(self::EXTENSIONES[$mime])) {
            throw new InvalidArgumentException('Formato de imagen no permitido. Usa JPEG, PNG o WebP.');
        }

        return [$bytes, self::EXTENSIONES[$mime]];
    }

    /**
     * Guarda la imagen y devuelve la ruta relativa dentro del disco.
     */
    public function fromBase64(string $base64, int $tenantId, string $uuid): string
    {
        [$bytes, $extension] = $this->decode($base64);

        $path = "diagnosticos/{$tenantId}/{$uuid}.{$extension}";
        Storage::disk($this->disk)->put($path, $bytes);

        return $path;
    }

    public function delete(?string $path): void
    {
        if ($path) {
            Storage::disk($this->disk)->delete($path);
        }
    }
}
