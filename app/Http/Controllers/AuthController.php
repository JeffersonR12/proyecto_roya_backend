<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Support\AuthRules;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use Throwable;

class AuthController extends Controller
{
    public const MENSAJE_RESET_GENERICO = 'Si el correo existe, te enviaremos instrucciones para restablecer la contraseña.';

    public function showLogin(): View
    {
        return view('app', [
            'page' => 'login',
            'analyses' => [],
            'authUser' => null,
        ]);
    }

    public function showRegister(): View
    {
        return view('app', [
            'page' => 'register',
            'analyses' => [],
            'authUser' => null,
        ]);
    }

    public function showForgot(): View
    {
        return view('app', [
            'page' => 'forgot',
            'analyses' => [],
            'authUser' => null,
        ]);
    }

    /**
     * La respuesta es identica exista o no el correo (y tambien si el broker
     * limita el reenvio), para no permitir enumerar cuentas.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'email' => ['required', 'string', AuthRules::GMAIL_REGEX],
        ], [
            'email.required' => 'El correo es obligatorio.',
            'email.regex' => 'El correo debe tener el formato usuario@gmail.com.',
        ]);

        try {
            Password::sendResetLink($request->only('email'));
        } catch (Throwable $exception) {
            // Un fallo del SMTP solo ocurre si el correo existe: devolver 500 permitiria
            // enumerar cuentas. Se registra para el equipo y se responde igual.
            report($exception);
        }

        return response()->json([
            'success' => true,
            'message' => self::MENSAJE_RESET_GENERICO,
        ]);
    }

    public function showReset(Request $request, string $token): View
    {
        return view('app', [
            'page' => 'reset',
            'analyses' => [],
            'authUser' => null,
            'reset' => [
                'token' => $token,
                'email' => strtolower(trim((string) $request->query('email'))),
            ],
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', AuthRules::GMAIL_REGEX],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ], [
            'token.required' => 'El enlace de restablecimiento no es válido.',
            'email.required' => 'El correo es obligatorio.',
            'email.regex' => 'El correo debe tener el formato usuario@gmail.com.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                // remember_token nuevo: cierra las sesiones "recordarme" de otros dispositivos.
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            // Mismo mensaje para token invalido, vencido o correo inexistente.
            throw ValidationException::withMessages([
                'email' => 'El enlace no es válido o ya venció. Solicita uno nuevo.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
            'redirect' => route('login'),
        ]);
    }

    public function login(LoginRequest $request): JsonResponse|RedirectResponse
    {
        if (app()->isProduction() && ! $request->secure()) {
            abort(403, 'El inicio de sesion solo se permite por HTTPS.');
        }

        $this->ensureIsNotRateLimited($request);

        $remember = $request->boolean('remember_me');
        Auth::guard('web')->setRememberDuration(AuthRules::REMEMBER_MINUTES);

        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($this->throttleKey($request), AuthRules::LOGIN_DECAY_SECONDS);

            throw ValidationException::withMessages([
                'credentials' => 'Las credenciales no son validas.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));
        $request->session()->regenerate();
        $request->user()->forceFill(['last_login_at' => now()])->save();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Sesion iniciada correctamente.',
                'redirect' => route('home'),
            ]);
        }

        return redirect()->intended(route('home'));
    }

    /**
     * El registro publico siempre crea un agricultor dentro de la cooperativa
     * del codigo de invitacion. Nunca crea tenants ni roles: los
     * administradores se crean con `php artisan roya:crear-admin`.
     */
    public function register(RegisterRequest $request): JsonResponse|RedirectResponse
    {
        $tenant = Tenant::query()
            ->where('codigo_invitacion', $request->validated('codigo_invitacion'))
            ->where('activo', true)
            ->firstOrFail();

        $rol = Role::query()->where('nombre', 'agricultor')->firstOrFail();

        $user = new User($request->safe()->only(['name', 'email', 'phone', 'password']));
        $user->forceFill([
            'tenant_id' => $tenant->id,
            'rol_id' => $rol->id,
            'role' => 'agricultor',
            'organization' => $tenant->nombre,
            'activo' => true,
        ])->save();

        Auth::login($user);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Cuenta creada correctamente.',
                'redirect' => route('home'),
            ], 201);
        }

        return redirect()->route('home');
    }

    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => route('login'),
            ]);
        }

        return redirect()->route('login');
    }

    private function ensureIsNotRateLimited(Request $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), AuthRules::LOGIN_ATTEMPTS)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'credentials' => "Demasiados intentos. Espera {$seconds} segundos e intentalo de nuevo.",
        ]);
    }

    private function throttleKey(Request $request): string
    {
        return 'login-ip:'.$request->ip();
    }
}
