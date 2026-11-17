<?php

use App\Http\Controllers\Api\DiagnosticoController;
use App\Http\Controllers\Api\DiagnosticoSyncController;
use Illuminate\Support\Facades\Route;

/*
| La PWA y la API comparten dominio, asi que /api usa la sesion web
| (cookie + CSRF). Para clientes externos bastaria con cambiar a
| 'auth:sanctum' cuando Sanctum este instalado.
*/
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/diagnosticos/sync', DiagnosticoSyncController::class)
        ->middleware('throttle:30,1')
        ->name('api.diagnosticos.sync');
    Route::get('/diagnosticos', [DiagnosticoController::class, 'index'])->name('api.diagnosticos.index');
    Route::patch('/diagnosticos/{uuid}/revision', [DiagnosticoController::class, 'revision'])
        ->whereUuid('uuid')
        ->name('api.diagnosticos.revision');
    Route::get('/diagnosticos/{uuid}/imagen', [DiagnosticoController::class, 'imagen'])
        ->whereUuid('uuid')
        ->name('api.diagnosticos.imagen');
});
