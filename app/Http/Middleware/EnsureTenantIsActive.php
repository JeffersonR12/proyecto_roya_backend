<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Cada recurso de la API requiere un usuario activo dentro de un tenant activo.
 * El filtrado por tenant de las consultas lo hace el trait BelongsToTenant.
 */
class EnsureTenantIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->activo || ! $user->tenant_id || ! $user->tenant?->activo) {
            throw new AccessDeniedHttpException('Usuario o tenant inactivo.');
        }

        return $next($request);
    }
}
