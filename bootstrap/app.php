<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureTenantIsActive;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(fn () => route('home'));

        // La PWA (mismo origen) usa la cookie de sesion con Sanctum; clientes
        // nativos pueden usar Bearer token con el mismo guard.
        $middleware->statefulApi();

        $middleware->alias([
            'role' => EnsureRole::class,
            'tenant' => EnsureTenantIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request): bool => $request->is('api/*');

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) use ($isApi) {
            $message = 'Demasiados intentos. Espera un momento e intentalo de nuevo.';

            if ($isApi($request)) {
                return response()->json(['success' => false, 'message' => $message], 429);
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $message,
                    'errors' => [
                        'credentials' => [$message],
                    ],
                ], 429);
            }
        });

        // Formato JSON consistente en /api: { success, data|errors, message } (rules.md §6).
        $exceptions->render(function (ValidationException $exception, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Los datos enviados no son validos.',
                    'errors' => $exception->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(['success' => false, 'message' => 'No autenticado.'], 401);
            }
        });

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $exception, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(['success' => false, 'message' => 'No tienes permiso para esta accion.'], 403);
            }
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $exception, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(['success' => false, 'message' => 'Recurso no encontrado.'], 404);
            }
        });
    })->create();
