<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Support\AuthRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function showLogin(): View
    {
        return $this->guestPage('login');
    }

    public function showRegister(): View
    {
        return $this->guestPage('register');
    }

    public function showForgot(): View
    {
        return $this->guestPage('forgot');
    }

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

        $payload = [
            'success' => true,
            'message' => 'Si el correo existe, te enviaremos instrucciones para restablecer la contraseña.',
        ];

        $user = User::query()->where('email', $request->string('email'))->first();

        if ($user) {
            $token = Password::broker()->createToken($user);
            $user->sendPasswordResetNotification($token);

            if (app()->environment('local')) {
                $payload['reset_url'] = url('/reset-password/'.$token.'?email='.urlencode($user->email));
            }
        }

        return response()->json($payload);
    }

    public function showReset(Request $request, string $token): View
    {
        return $this->guestPage('reset', [
            'resetToken' => $token,
            'resetEmail' => strtolower(trim((string) $request->query('email', ''))),
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
            'password' => ['required', 'confirmed', AuthRules::password()],
        ], array_merge([
            'token.required' => 'El enlace de recuperacion no es valido.',
            'email.required' => 'El correo es obligatorio.',
            'email.regex' => 'El correo debe tener el formato usuario@gmail.com.',
        ], AuthRules::passwordMessages()));

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => 'El enlace no es valido o ya expiro. Solicita uno nuevo.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada. Ya puedes iniciar sesion.',
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

    public function register(RegisterRequest $request): JsonResponse|RedirectResponse
    {
        $user = User::create([
            ...$request->safe()->except('terms'),
            'role' => 'tecnico',
        ]);

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
        $email = strtolower(trim((string) $request->input('email')));

        return 'login-attempt:'.$email.'|'.$request->ip();
    }

    private function guestPage(string $page, array $extra = []): View
    {
        return view('app', array_merge([
            'page' => $page,
            'listing' => null,
            'authUser' => null,
            'resetToken' => '',
            'resetEmail' => '',
        ], $extra));
    }
}
