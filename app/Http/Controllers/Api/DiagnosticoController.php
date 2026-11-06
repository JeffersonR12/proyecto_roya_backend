<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncDiagnosticosRequest;
use App\Http\Requests\UpdateDiagnosticoRequest;
use App\Http\Resources\DiagnosticoResource;
use App\Models\Diagnostico;
use App\Models\User;
use App\Services\AlertaService;
use App\Services\DiagnosticoSyncService;
use App\Services\EvidenciaStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DiagnosticoController extends Controller
{
    /** GET /api/diagnosticos: listado paginado y filtrable, segun rol. */
    public function index(Request $request): JsonResponse
    {
        $filtros = $request->validate([
            'clase' => ['sometimes', Rule::in(Diagnostico::CLASES)],
            'hitl_status' => ['sometimes', Rule::in(Diagnostico::HITL_STATUSES)],
            'parcela_id' => ['sometimes', 'integer'],
            'desde' => ['sometimes', 'date'],
            'hasta' => ['sometimes', 'date'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ]);

        $pagina = Diagnostico::query()
            ->visiblePara($request->user())
            ->with(['parcela', 'usuario', 'catalogo'])
            ->when($filtros['clase'] ?? null, fn ($q, $v) => $q->where('clase', $v))
            ->when($filtros['hitl_status'] ?? null, fn ($q, $v) => $q->where('hitl_status', $v))
            ->when($filtros['parcela_id'] ?? null, fn ($q, $v) => $q->where('parcela_id', $v))
            ->when($filtros['desde'] ?? null, fn ($q, $v) => $q->where('captured_at', '>=', $v))
            ->when($filtros['hasta'] ?? null, fn ($q, $v) => $q->where('captured_at', '<=', $v))
            ->orderByDesc('captured_at')
            ->paginate($filtros['per_page'] ?? 25);

        return response()->json([
            'success' => true,
            'data' => DiagnosticoResource::collection($pagina->items()),
            'meta' => [
                'current_page' => $pagina->currentPage(),
                'last_page' => $pagina->lastPage(),
                'per_page' => $pagina->perPage(),
                'total' => $pagina->total(),
            ],
        ]);
    }

    /** POST /api/diagnosticos: alta individual, con las mismas reglas que el sync. */
    public function store(Request $request, DiagnosticoSyncService $sync): JsonResponse
    {
        $request->merge(['items' => [$request->except('items')]]);
        $validated = $request->validate((new SyncDiagnosticosRequest)->rules());

        $resultado = $sync->sincronizar($request->user(), $validated['items'])['items'][0];
        $codigo = match ($resultado['status']) {
            'confirmed' => 201,
            'already_exists' => 200,
            'conflict' => 409,
            default => 422,
        };

        return response()->json([
            'success' => in_array($resultado['status'], ['confirmed', 'already_exists'], true),
            'message' => $resultado['message'] ?? null,
            'data' => $resultado,
        ], $codigo);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new DiagnosticoResource($this->visible($request->user(), $uuid)->load(['parcela', 'usuario', 'catalogo'])),
        ]);
    }

    /** PATCH /api/diagnosticos/{uuid}: validacion HITL y correccion (tecnico/administrador). */
    public function update(UpdateDiagnosticoRequest $request, string $uuid, AlertaService $alertas): JsonResponse
    {
        $diagnostico = $this->visible($request->user(), $uuid);
        $diagnostico->fill($request->validated())->save();
        $alertas->evaluar($diagnostico->load('catalogo', 'parcela'));

        return response()->json([
            'success' => true,
            'message' => 'Diagnostico actualizado.',
            'data' => new DiagnosticoResource($diagnostico->load(['usuario'])),
        ]);
    }

    /** DELETE /api/diagnosticos/{uuid}: baja logica (administrador). */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $this->visible($request->user(), $uuid)->delete();

        return response()->json(['success' => true, 'message' => 'Diagnostico dado de baja.']);
    }

    /** GET /api/diagnosticos/{uuid}/imagen: evidencia privada, con el mismo control de acceso. */
    public function imagen(Request $request, string $uuid): StreamedResponse
    {
        $diagnostico = $this->visible($request->user(), $uuid);
        $disk = Storage::disk(EvidenciaStore::DISK);

        if (! $diagnostico->imagen_path || ! $disk->exists($diagnostico->imagen_path)) {
            throw new NotFoundHttpException;
        }

        return $disk->response($diagnostico->imagen_path, null, [
            'Cache-Control' => 'private, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function visible(User $user, string $uuid): Diagnostico
    {
        return Diagnostico::query()
            ->visiblePara($user)
            ->where('uuid_local', strtolower($uuid))
            ->firstOrFail();
    }
}
