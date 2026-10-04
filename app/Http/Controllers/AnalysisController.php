<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalysisRequest;
use App\Models\Analysis;
use App\Support\InspectionImage;
use App\Support\Risk;
use App\Support\SimulatedInspection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalysisController extends Controller
{
    public function index(Request $request): View
    {
        return view('app', [
            'page' => 'app',
            'listing' => $this->listing($request),
            'authUser' => $request->user(),
            'resetToken' => '',
            'resetEmail' => '',
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        return response()->json($this->listing($request));
    }

    public function store(AnalysisRequest $request): JsonResponse
    {
        $path = InspectionImage::store($request->string('image_base64')->toString(), $request->user()->id);
        $confidence = SimulatedInspection::confidence();

        $analysis = Analysis::create([
            'user_id' => $request->user()->id,
            'disease_detected' => SimulatedInspection::DISEASE,
            'confidence' => $confidence,
            'image_path' => $path,
            'location' => $request->input('location'),
        ]);

        $analysis->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Inspeccion guardada correctamente.',
            'analysis' => $analysis,
            'estimate' => Risk::present($confidence),
        ], 201);
    }

    public function export(Request $request): StreamedResponse
    {
        $analyses = $this->applySearch($this->visibleAnalyses($request), $this->term($request))
            ->with('user')
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($analyses): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['fecha', 'diagnostico', 'afectacion', 'riesgo', 'ubicacion', 'tecnico']);

            foreach ($analyses as $analysis) {
                $level = Risk::level((float) $analysis->confidence);

                fputcsv($handle, [
                    optional($analysis->created_at)->format('d/m/Y H:i'),
                    $analysis->disease_detected,
                    number_format((float) $analysis->confidence * 100, 1, '.', '').'%',
                    Risk::label($level),
                    $analysis->location ?: 'Sin ubicacion',
                    $analysis->user->name ?? 'Sin asignar',
                ]);
            }

            fclose($handle);
        }, 'inspecciones-roya.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function listing(Request $request): array
    {
        $searched = $this->applySearch($this->visibleAnalyses($request), $this->term($request));
        $stats = $this->stats(clone $searched);

        $activity = (clone $searched)
            ->where('created_at', '>=', now()->subDays(16))
            ->reorder()
            ->latest()
            ->get(['created_at'])
            ->map(fn (Analysis $analysis) => [
                'created_at' => $analysis->created_at,
            ])
            ->values();

        $recent = (clone $searched)->with('user')->reorder()->latest()->limit(3)->get();

        $listed = $this->applyRisk(clone $searched, (string) $request->query('risk', 'all'));
        $page = $listed->with('user')->reorder()->latest()->paginate(12);

        return [
            'data' => $page->items(),
            'recent' => $recent,
            'activity' => $activity,
            'stats' => $stats,
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ];
    }

    private function visibleAnalyses(Request $request): Builder
    {
        $query = Analysis::query();

        if ($request->user()->role !== 'administrador') {
            $query->where('user_id', $request->user()->id);
        }

        return $query;
    }

    private function applySearch(Builder $query, string $term): Builder
    {
        if ($term === '') {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(function (Builder $inner) use ($like): void {
            $inner->where('disease_detected', 'like', $like)
                ->orWhere('location', 'like', $like)
                ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $like));
        });
    }

    private function applyRisk(Builder $query, string $risk): Builder
    {
        return match ($risk) {
            'critical' => $query->where('confidence', '>', 0.3),
            'medium' => $query->where('confidence', '>=', 0.1)->where('confidence', '<=', 0.3),
            'healthy' => $query->where('confidence', '<', 0.1),
            default => $query,
        };
    }

    private function stats(Builder $query): array
    {
        $row = $query->reorder()->selectRaw('
            count(*) as total,
            sum(case when confidence > 0.3 then 1 else 0 end) as critical,
            sum(case when confidence >= 0.1 and confidence <= 0.3 then 1 else 0 end) as medium,
            sum(case when confidence < 0.1 then 1 else 0 end) as healthy
        ')->first();

        return [
            'total' => (int) ($row->total ?? 0),
            'critical' => (int) ($row->critical ?? 0),
            'medium' => (int) ($row->medium ?? 0),
            'healthy' => (int) ($row->healthy ?? 0),
        ];
    }

    private function term(Request $request): string
    {
        return mb_substr(trim((string) $request->query('q', '')), 0, 100);
    }
}
