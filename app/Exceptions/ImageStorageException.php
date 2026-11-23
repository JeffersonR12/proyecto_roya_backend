<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * El disco de fotos (local o S3/Supabase) no acepto la imagen. Es un fallo temporal
 * del servidor, no un dato invalido: responde 503 para que la PWA reintente el lote
 * con backoff en vez de marcar el diagnostico como rechazado para siempre.
 */
class ImageStorageException extends RuntimeException
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'El almacenamiento de fotos no esta disponible. Se reintentara automaticamente.',
        ], 503, ['Retry-After' => '60']);
    }
}
