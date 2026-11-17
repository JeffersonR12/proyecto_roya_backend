<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncDiagnosticosRequest;
use App\Models\Diagnostico;
use App\Models\SyncEvent;
use App\Models\User;
use App\Services\ImageStore;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Recibe la cola Outbox de la PWA. Es idempotente por uuid_local:
 * reenviar el mismo registro lo confirma de nuevo sin duplicarlo.
 */
class DiagnosticoSyncController extends Controller
{
    public function __construct(private readonly ImageStore $images) {}

    public function __invoke(SyncDiagnosticosRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $confirmados = [];
        $rechazados = [];
        $eventos = [];

        foreach ($request->validated('diagnosticos') as $item) {
            $uuid = $item['uuid_local'];
            [$estado, $error] = $this->procesar($item, $user);

            if ($error === null) {
                $confirmados[] = $uuid;
            } else {
                $rechazados[] = ['uuid_local' => $uuid, 'error' => $error];
            }

            $eventos[] = [
                'tenant_id' => $user->tenant_id,
                'uuid_local' => $uuid,
                'estado' => $estado,
                'intentos' => 1,
                'ultimo_error' => $error,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        SyncEvent::query()->insert($eventos);

        return response()->json([
            'confirmados' => $confirmados,
            'rechazados' => $rechazados,
        ]);
    }

    /**
     * @return array{0: string, 1: string|null} [estado, error]
     */
    private function procesar(array $item, User $user): array
    {
        $existente = $this->buscar($item['uuid_local']);

        if ($existente) {
            return $this->resolverExistente($existente, $user);
        }

        $path = null;

        try {
            $path = $this->images->fromBase64($item['imagen'], $user->tenant_id, $item['uuid_local']);

            DB::transaction(fn () => Diagnostico::query()->create([
                ...$this->atributos($item, $user),
                'imagen_path' => $path,
            ]));

            return ['confirmed', null];
        } catch (UniqueConstraintViolationException) {
            // Otra peticion guardo el mismo uuid_local al mismo tiempo.
            $this->images->delete($path);
            $existente = $this->buscar($item['uuid_local']);

            return $existente
                ? $this->resolverExistente($existente, $user)
                : ['error', 'No se pudo guardar el diagnostico.'];
        } catch (Throwable $exception) {
            $this->images->delete($path);
            report($exception);

            return ['error', 'No se pudo guardar el diagnostico.'];
        }
    }

    private function buscar(string $uuid): ?Diagnostico
    {
        // Sin el filtro de tenant: un uuid de otro tenant tambien debe detectarse.
        return Diagnostico::query()
            ->withoutGlobalScope('tenant')
            ->where('uuid_local', $uuid)
            ->first();
    }

    /**
     * @return array{0: string, 1: string|null}
     */
    private function resolverExistente(Diagnostico $existente, User $user): array
    {
        if ((int) $existente->tenant_id === (int) $user->tenant_id && (int) $existente->usuario_id === (int) $user->id) {
            return ['duplicate', null];
        }

        return ['rejected', 'El uuid_local ya pertenece a otro registro.'];
    }

    private function atributos(array $item, User $user): array
    {
        $atributos = [
            'uuid_local' => $item['uuid_local'],
            'tenant_id' => $user->tenant_id,
            'usuario_id' => $user->id,
            'clase' => $item['clase'],
            'confianza' => $item['confianza'],
            'severidad' => $item['severidad'] ?? null,
            'latitud' => $item['latitud'] ?? null,
            'longitud' => $item['longitud'] ?? null,
            'ubicacion' => $item['ubicacion'] ?? null,
            'modelo_version' => $item['modelo_version'],
            'captured_at' => $item['captured_at'],
            'synced_at' => now(),
            'sync_status' => 'confirmed',
        ];

        // Solo el personal tecnico puede traer una revision ya hecha offline.
        if ($user->isStaff()) {
            $atributos['hitl_status'] = $item['hitl_status'] ?? null;
            $atributos['etiqueta_humana'] = $item['etiqueta_humana'] ?? null;
        }

        return array_filter($atributos, fn ($value) => $value !== null);
    }
}
