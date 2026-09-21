<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AnalysisController extends Controller
{
    public function index(Request $request): View
    {
        return view('app', [
            'page' => 'app',
            'analyses' => $this->visibleAnalyses($request)->get(),
            'authUser' => $request->user(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'disease_detected' => ['required', 'string', 'max:255'],
            'confidence' => ['required', 'numeric', 'between:0,1'],
            'image_base64' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['user_id'] = $request->user()->id;
        $analysis = Analysis::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inspeccion guardada correctamente.',
            'analysis' => $analysis->load('user'),
        ], 201);
    }

    private function visibleAnalyses(Request $request)
    {
        $query = Analysis::query()->with('user')->latest();

        if ($request->user()->role !== 'administrador') {
            $query->where('user_id', $request->user()->id);
        }

        return $query;
    }
}
