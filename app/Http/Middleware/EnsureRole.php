<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * RBAC: role:tecnico,administrador. Responde 403 si el rol no esta permitido.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->roleName(), $roles, true)) {
            throw new AccessDeniedHttpException('Rol no autorizado.');
        }

        return $next($request);
    }
}
