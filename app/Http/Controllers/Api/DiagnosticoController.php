<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Diagnostico;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DiagnosticoController extends Controller
{
    /**
     * Historial del servidor. El agricultor ve solo los suyos; tecnico y
     * administrador ven todo su tenant. El scope global ya filtra por tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'between:1,200'],
            'desde' => ['nullable', 'date'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $query = Diagnostico::query()
            ->with('usuario:id,name')
            ->where('tenant_id', $user->tenant_id)
            ->latest('captured_at');

        if (! $user->isStaff()) {
            $query->where('usuario_id', $user->id);
        }

        if (isset($validated['desde'])) {
            $query->where('updated_at', '>=', $validated['desde']);
        }

        $pagina = $query->paginate($validated['per_page'] ?? 100);

        return response()->json([
            'data' => $pagina->getCollection()->map(fn (Diagnostico $d) => $this->recurso($d))->values(),
            'meta' => [
                // La PWA lo compara con su sesion local para detectar un cambio de usuario.
                'usuario_id' => (int) $user->id,
                'tenant_id' => (int) $user->tenant_id,
                'current_page' => $pagina->currentPage(),
                'last_page' => $pagina->lastPage(),
                'total' => $pagina->total(),
            ],
        ]);
    }

    /**
     * Revision humana (HITL). Solo tecnico y administrador del mismo tenant.
     */
    public function revision(Request $request, string $uuid): JsonResponse
    {
        $diagnostico = $this->encontrar($uuid);
        Gate::authorize('review', $diagnostico);

        $validated = $request->validate([
            'hitl_status' => ['sometimes', 'required', Rule::in(Diagnostico::HITL_ESTADOS)],
            'etiqueta_humana' => ['sometimes', 'nullable', Rule::in(Diagnostico::CLASES)],
        ]);

        if ($validated === []) {
            return response()->json([
                'message' => 'Envia hitl_status o etiqueta_humana.',
            ], 422);
        }

        $diagnostico->fill($validated)->save();

        return response()->json(['data' => $this->recurso($diagnostico->load('usuario:id,name'))]);
    }

    /**
     * Imagen del diagnostico, servida desde el disco privado.
     */
    public function imagen(string $uuid): StreamedResponse
    {
        $diagnostico = $this->encontrar($uuid);
        Gate::authorize('view', $diagnostico);

        abort_unless(
            $diagnostico->imagen_path && Storage::disk('local')->exists($diagnostico->imagen_path),
            404
        );

        return Storage::disk('local')->response($diagnostico->imagen_path, null, [
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    private function encontrar(string $uuid): Diagnostico
    {
        // El scope de tenant hace que un uuid de otro tenant responda 404.
        return Diagnostico::query()->where('uuid_local', $uuid)->firstOrFail();
    }

    private function recurso(Diagnostico $d): array
    {
        return [
            'uuid_local' => $d->uuid_local,
            'clase' => $d->clase,
            'confianza' => (float) $d->confianza,
            'severidad' => $d->severidad === null ? null : (float) $d->severidad,
            'latitud' => $d->latitud === null ? null : (float) $d->latitud,
            'longitud' => $d->longitud === null ? null : (float) $d->longitud,
            'ubicacion' => $d->ubicacion,
            'modelo_version' => $d->modelo_version,
            'captured_at' => $d->captured_at?->toIso8601String(),
            'synced_at' => $d->synced_at?->toIso8601String(),
            'hitl_status' => $d->hitl_status,
            'etiqueta_humana' => $d->etiqueta_humana,
            'usuario' => $d->usuario ? ['id' => $d->usuario->id, 'name' => $d->usuario->name] : null,
            'imagen_url' => route('api.diagnosticos.imagen', $d->uuid_local),
        ];
    }
}
