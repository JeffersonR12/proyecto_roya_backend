<?php

use App\Http\Controllers\Api\ConsultaController;
use App\Http\Controllers\Api\DiagnosticoController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

/*
| API REST del Core (prefijo /api). Docs/09 y rules.md §6.
| auth:sanctum acepta la cookie de sesion de la PWA (mismo origen) o Bearer token.
*/

Route::get('/health', HealthController::class)->name('api.health');

Route::middleware(['auth:sanctum', 'tenant', 'throttle:api'])->group(function () {
    Route::post('/sync/diagnosticos', [SyncController::class, 'store'])
        ->middleware('throttle:sync')
        ->name('api.sync.diagnosticos');
    Route::get('/sync/status', [SyncController::class, 'status'])->name('api.sync.status');

    Route::get('/diagnosticos', [DiagnosticoController::class, 'index'])->name('api.diagnosticos.index');
    Route::post('/diagnosticos', [DiagnosticoController::class, 'store'])
        ->middleware('throttle:sync')
        ->name('api.diagnosticos.store');
    Route::get('/diagnosticos/{uuid}', [DiagnosticoController::class, 'show'])->name('api.diagnosticos.show');
    Route::get('/diagnosticos/{uuid}/imagen', [DiagnosticoController::class, 'imagen'])->name('api.diagnosticos.imagen');
    Route::patch('/diagnosticos/{uuid}', [DiagnosticoController::class, 'update'])
        ->middleware('role:tecnico,administrador')
        ->name('api.diagnosticos.update');
    Route::delete('/diagnosticos/{uuid}', [DiagnosticoController::class, 'destroy'])
        ->middleware('role:administrador')
        ->name('api.diagnosticos.destroy');

    Route::get('/catalogo', [ConsultaController::class, 'catalogo'])->name('api.catalogo');
    Route::get('/parcelas', [ConsultaController::class, 'parcelas'])->name('api.parcelas');
    Route::get('/alertas', [ConsultaController::class, 'alertas'])->name('api.alertas.index');
    Route::patch('/alertas/{id}/leida', [ConsultaController::class, 'marcarAlertaLeida'])
        ->whereNumber('id')
        ->name('api.alertas.leida');
});
