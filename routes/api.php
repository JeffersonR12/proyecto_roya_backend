<?php

use App\Http\Controllers\Api\DiagnosticoController;
use App\Http\Controllers\Api\DiagnosticoSyncController;
use App\Http\Controllers\Api\TenantInvitacionController;
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

    // Solo administrador (se valida en el controlador contra su propio tenant).
    Route::get('/tenant/invitacion', [TenantInvitacionController::class, 'show'])
        ->name('api.tenant.invitacion');
    Route::post('/tenant/invitacion/regenerar', [TenantInvitacionController::class, 'regenerar'])
        ->middleware('throttle:10,1')
        ->name('api.tenant.invitacion.regenerar');
});
