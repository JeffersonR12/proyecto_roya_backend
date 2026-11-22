<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Codigo de invitacion de la cooperativa. Solo el administrador de su propio
 * tenant lo ve o lo regenera; el tenant sale de la sesion, nunca del request.
 */
class TenantInvitacionController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $tenant = $this->tenantDelAdministrador($request);

        return response()->json($this->recurso($tenant));
    }

    public function regenerar(Request $request): JsonResponse
    {
        $tenant = $this->tenantDelAdministrador($request);
        $tenant->regenerarCodigoInvitacion();

        return response()->json([
            ...$this->recurso($tenant),
            'message' => 'Código regenerado. El anterior ya no sirve para registrarse.',
        ]);
    }

    private function tenantDelAdministrador(Request $request): Tenant
    {
        /** @var User $user */
        $user = $request->user();

        // rolEfectivo usa la tabla roles; la columna legacy users.role no da permisos aqui.
        abort_unless($user->rolEfectivo() === 'administrador', 403, 'Solo el administrador puede gestionar el código de invitación.');

        $tenant = $user->tenant;
        abort_if($tenant === null, 404, 'Tu cuenta no tiene cooperativa asignada.');

        return $tenant;
    }

    /**
     * @return array{tenant: string, codigo_invitacion: string|null, activo: bool}
     */
    private function recurso(Tenant $tenant): array
    {
        return [
            'tenant' => $tenant->nombre,
            'codigo_invitacion' => $tenant->codigo_invitacion,
            'activo' => (bool) $tenant->activo,
        ];
    }
}
