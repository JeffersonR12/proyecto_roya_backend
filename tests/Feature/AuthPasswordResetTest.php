<?php

namespace Tests\Feature;

use App\Http\Controllers\AuthController;
use App\Models\User;
use App\Notifications\RestablecerContrasena;
use App\Support\AuthRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use RuntimeException;
use Tests\TestCase;

/**
 * T-06: recuperacion de contraseña de punta a punta con el broker de Laravel.
 */
class AuthPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_spanish_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'reset.ok@gmail.com', 'name' => 'Rosa Campo']);

        $this->postJson('/forgot-password', ['email' => 'RESET.OK@gmail.com'])
            ->assertOk()
            ->assertJsonPath('message', AuthController::MENSAJE_RESET_GENERICO);

        Notification::assertSentTo($user, RestablecerContrasena::class, function (RestablecerContrasena $notification) use ($user) {
            $mail = $notification->toMail($user);
            $html = (string) $mail->render();

            $this->assertStringContainsString('RiwiScan', $mail->subject);
            $this->assertStringContainsString('Restablece tu contraseña', $mail->subject);
            $this->assertStringContainsString('Hola, Rosa Campo', $html);
            $this->assertStringContainsString('/reset-password/'.$notification->token, $html);
            $this->assertStringContainsString('email=reset.ok%40gmail.com', $html);
            $this->assertStringNotContainsString('Reset Password', $html);

            return true;
        });
    }

    public function test_forgot_password_responds_the_same_for_unknown_email(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'existe.igual@gmail.com']);

        $existe = $this->postJson('/forgot-password', ['email' => 'existe.igual@gmail.com']);
        $noExiste = $this->postJson('/forgot-password', ['email' => 'no.existe.igual@gmail.com']);

        $existe->assertOk();
        $noExiste->assertOk();
        $this->assertSame($existe->json(), $noExiste->json());
        Notification::assertSentTimes(RestablecerContrasena::class, 1);
    }

    public function test_forgot_password_hides_mail_transport_failures(): void
    {
        $user = User::factory()->create(['email' => 'smtp.caido@gmail.com']);
        Password::shouldReceive('sendResetLink')->once()->andThrow(new RuntimeException('SMTP caido'));

        $this->postJson('/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', AuthController::MENSAJE_RESET_GENERICO);
    }

    public function test_reset_page_is_reachable_with_token(): void
    {
        $this->get('/reset-password/token-de-prueba?email=ana@gmail.com')
            ->assertOk()
            ->assertSee('page: "reset"', false)
            ->assertSee('token-de-prueba', false);
    }

    public function test_valid_token_changes_the_password(): void
    {
        $user = User::factory()->create(['email' => 'cambia.clave@gmail.com']);
        $rememberAntes = $user->remember_token;
        $token = Password::createToken($user);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => 'cambia.clave@gmail.com',
            'password' => 'nuevaClave9',
            'password_confirmation' => 'nuevaClave9',
        ])->assertOk()->assertJsonPath('success', true);

        $user->refresh();
        $this->assertTrue(Hash::check('nuevaClave9', $user->password));
        $this->assertNotSame($rememberAntes, $user->remember_token);
        $this->assertGuest();

        // El token es de un solo uso.
        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => 'cambia.clave@gmail.com',
            'password' => 'otraClave99',
            'password_confirmation' => 'otraClave99',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->postJson('/login', ['email' => 'cambia.clave@gmail.com', 'password' => 'nuevaClave9'])->assertOk();
    }

    public function test_invalid_token_fails_and_keeps_the_password(): void
    {
        $user = User::factory()->create(['email' => 'token.malo@gmail.com', 'password' => 'password']);
        Password::createToken($user);

        $this->postJson('/reset-password', [
            'token' => 'token-falso',
            'email' => 'token.malo@gmail.com',
            'password' => 'nuevaClave9',
            'password_confirmation' => 'nuevaClave9',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_token_of_another_user_fails(): void
    {
        $victima = User::factory()->create(['email' => 'victima@gmail.com', 'password' => 'password']);
        $atacante = User::factory()->create(['email' => 'atacante@gmail.com']);
        $token = Password::createToken($atacante);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => 'victima@gmail.com',
            'password' => 'nuevaClave9',
            'password_confirmation' => 'nuevaClave9',
        ])->assertStatus(422);

        $this->assertTrue(Hash::check('password', $victima->fresh()->password));
    }

    public function test_reset_validates_password_rules(): void
    {
        $user = User::factory()->create(['email' => 'reglas@gmail.com']);

        $this->postJson('/reset-password', [
            'token' => Password::createToken($user),
            'email' => 'reglas@gmail.com',
            'password' => 'corta',
            'password_confirmation' => 'distinta',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_forgot_password_is_rate_limited_per_ip(): void
    {
        Notification::fake();

        for ($i = 0; $i < AuthRules::PUBLIC_FORM_ATTEMPTS; $i++) {
            $this->postJson('/forgot-password', ['email' => "limite{$i}@gmail.com"])->assertOk();
        }

        $this->postJson('/forgot-password', ['email' => 'limite@gmail.com'])->assertStatus(429);
    }
}
