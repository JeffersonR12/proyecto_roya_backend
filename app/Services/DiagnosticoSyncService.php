<?php

namespace App\Services;

use App\Models\CatalogoFitosanitario;
use App\Models\Diagnostico;
use App\Models\Parcela;
use App\Models\SyncEvent;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

/**
 * Sincronizacion Edge -> Cloud de diagnosticos (Docs/09 §4-6, rules.md §6).
 *
 * Idempotente por uuid_local:
 * - UUID nuevo                       => se crea, status "confirmed".
 * - UUID repetido, mismo contenido   => no se inserta, status "already_exists".
 * - UUID repetido con otro contenido => incidente en sync_events + log, status "conflict".
 * - Datos de negocio invalidos       => status "rejected" (no se persiste).
 *
 * El lote completo corre en una transaccion.
 */
class DiagnosticoSyncService
{
    /** @var array<string, int|null> */
    private array $catalogoIds = [];

    public function __construct(
        private readonly EvidenciaStore $evidencias,
        private readonly AlertaService $alertas,
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array{processed:int, created:int, already_exists:int, failed:int, items:array<int, array<string, mixed>>}
     */
    public function sincronizar(User $user, array $items): array
    {
        $resultados = DB::transaction(
            fn () => array_map(fn (array $item) => $this->procesar($user, $item), $items)
        );

        $estados = array_count_values(array_column($resultados, 'status'));

        return [
            'processed' => count($resultados),
            'created' => $estados['confirmed'] ?? 0,
            'already_exists' => $estados['already_exists'] ?? 0,
            'failed' => ($estados['conflict'] ?? 0) + ($estados['rejected'] ?? 0),
            'items' => $resultados,
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function procesar(User $user, array $item): array
    {
        $uuid = strtolower((string) $item['uuid_local']);

        $existente = Diagnostico::query()
            ->withoutGlobalScopes()
            ->withTrashed()
            ->where('uuid_local', $uuid)
            ->first();

        if ($existente) {
            return $this->resolverExistente($user, $existente, $item, $uuid);
        }

        $parcelaId = $this->resolverParcela($user, $item);

        if ($parcelaId === false) {
            return $this->resultado($user, $uuid, 'rejected', 'La parcela no existe o no esta autorizada.');
        }

        $imagenPath = null;

        if (! empty($item['imagen_base64'])) {
            try {
                $imagenPath = $this->evidencias->guardarDataUrl((string) $item['imagen_base64'], $user->tenant_id, $uuid);
            } catch (InvalidArgumentException $exception) {
                return $this->resultado($user, $uuid, 'rejected', $exception->getMessage());
            }
        }

        $clase = Diagnostico::claseEfectiva($item['clase'], $item['confianza']);

        $diagnostico = Diagnostico::query()->create([
            'uuid_local' => $uuid,
            'tenant_id' => $user->tenant_id,
            'usuario_id' => $user->id,
            'parcela_id' => $parcelaId,
            'catalogo_id' => $this->catalogoId($clase),
            'clase' => $clase,
            'confianza' => $item['confianza'],
            'severidad' => $item['severidad'] ?? null,
            'scores' => $item['scores'] ?? null,
            'latitud' => $item['latitud'] ?? null,
            'longitud' => $item['longitud'] ?? null,
            'imagen_path' => $imagenPath,
            'modelo_version' => $item['modelo_version'],
            'captured_at' => $this->fecha($item['captured_at']),
            'synced_at' => now(),
            'sync_status' => 'confirmed',
            'hitl_status' => $this->hitlInicial($user, $item, $clase),
            'etiqueta_humana' => $user->isStaff() ? ($item['etiqueta_humana'] ?? null) : null,
        ]);

        $this->alertas->evaluar($diagnostico);

        return $this->resultado($user, $uuid, 'confirmed', null, $diagnostico->id);
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function resolverExistente(User $user, Diagnostico $existente, array $item, string $uuid): array
    {
        if ($existente->tenant_id !== $user->tenant_id || ! $this->mismoContenido($existente, $item)) {
            Log::warning('Conflicto de sincronizacion: uuid_local repetido con contenido distinto.', [
                'uuid_local' => $uuid,
                'tenant_solicitante' => $user->tenant_id,
                'usuario_id' => $user->id,
                'mismo_tenant' => $existente->tenant_id === $user->tenant_id,
            ]);

            return $this->resultado($user, $uuid, 'conflict', 'El uuid_local ya existe con datos distintos. Se registro el incidente.');
        }

        // Campos mutables tras la captura: solo personal tecnico puede cambiarlos.
        if ($user->isStaff() && ! $existente->trashed()) {
            $cambios = [];

            if (! empty($item['hitl_status']) && $item['hitl_status'] !== $existente->hitl_status) {
                $cambios['hitl_status'] = $item['hitl_status'];
            }

            if (array_key_exists('etiqueta_humana', $item) && $item['etiqueta_humana'] !== $existente->etiqueta_humana) {
                $cambios['etiqueta_humana'] = $item['etiqueta_humana'];
            }

            if ($cambios) {
                $existente->fill($cambios)->save();
                $this->alertas->evaluar($existente);
            }
        }

        return $this->resultado($user, $uuid, 'already_exists', null, $existente->id);
    }

    /** @param array<string, mixed> $item */
    private function mismoContenido(Diagnostico $existente, array $item): bool
    {
        $clase = Diagnostico::claseEfectiva($item['clase'], $item['confianza']);
        $capturedAt = $this->fecha($item['captured_at']);

        return $existente->clase === $clase
            && abs((float) $existente->confianza - (float) $item['confianza']) < 0.01
            && $existente->modelo_version === $item['modelo_version']
            && abs($existente->captured_at->diffInSeconds($capturedAt, false)) < 1;
    }

    /**
     * El Edge envia ISO 8601 con offset (-05:00). Eloquent guarda la hora sin
     * convertir, asi que se normaliza a la zona de la aplicacion antes de persistir.
     */
    private function fecha(string $valor): Carbon
    {
        return Carbon::parse($valor)->setTimezone(config('app.timezone'));
    }

    /**
     * @param  array<string, mixed>  $item
     * @return int|null|false false = parcela no autorizada
     */
    private function resolverParcela(User $user, array $item): int|null|false
    {
        $parcelas = Parcela::query()->withoutGlobalScopes()->where('tenant_id', $user->tenant_id);

        if (! empty($item['parcela_id'])) {
            if (! $user->isStaff()) {
                $parcelas->where('usuario_id', $user->id);
            }

            return $parcelas->whereKey($item['parcela_id'])->value('id') ?? false;
        }

        $nombre = trim((string) ($item['parcela_nombre'] ?? ''));

        if ($nombre === '') {
            return null;
        }

        return $parcelas->firstOrCreate(
            ['tenant_id' => $user->tenant_id, 'nombre' => $nombre],
            ['usuario_id' => $user->id, 'cultivo' => 'trigo'],
        )->id;
    }

    /** @param array<string, mixed> $item */
    private function hitlInicial(User $user, array $item, string $clase): string
    {
        $solicitado = $item['hitl_status'] ?? null;

        if ($user->isStaff() && in_array($solicitado, Diagnostico::HITL_STATUSES, true)) {
            return $solicitado;
        }

        return $clase === 'sana' ? 'not_required' : 'pending';
    }

    private function catalogoId(string $clase): ?int
    {
        $codigo = Diagnostico::CATALOGO_POR_CLASE[$clase] ?? null;

        if (! $codigo) {
            return null;
        }

        return $this->catalogoIds[$codigo] ??= CatalogoFitosanitario::query()->where('codigo', $codigo)->value('id');
    }

    /** @return array<string, mixed> */
    private function resultado(User $user, string $uuid, string $status, ?string $mensaje = null, ?int $id = null): array
    {
        $evento = SyncEvent::query()->firstOrNew([
            'tenant_id' => $user->tenant_id,
            'uuid_local' => $uuid,
        ]);
        $evento->estado = $status;
        $evento->intentos = (int) $evento->intentos + 1;
        $evento->ultimo_error = $mensaje;
        $evento->save();

        return array_filter([
            'uuid_local' => $uuid,
            'status' => $status,
            'id' => $id,
            'message' => $mensaje,
        ], fn ($value) => $value !== null);
    }
}
