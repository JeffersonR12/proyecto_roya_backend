<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_user_receives_reset_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'campo@gmail.com']);

        $this->postJson('/forgot-password', ['email' => ' Campo@gmail.com '])
            ->assertOk()
            ->assertJsonPath('success', true);

        Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
            $mail = $notification->toMail($user);

            return str_contains($mail->actionUrl, '/reset-password/'.$notification->token)
                && str_contains($mail->actionUrl, 'email=campo%40gmail.com');
        });
    }

    public function test_unknown_email_gets_the_same_generic_response(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'existe@gmail.com']);

        $existe = $this->postJson('/forgot-password', ['email' => 'existe@gmail.com'])->json('message');
        $noExiste = $this->postJson('/forgot-password', ['email' => 'nadie@gmail.com'])->json('message');

        $this->assertSame($existe, $noExiste);
        Notification::assertCount(1);
    }

    public function test_reset_page_is_reachable_with_token(): void
    {
        $this->get('/reset-password/abc123?email=campo@gmail.com')
            ->assertOk()
            ->assertSee('token: "abc123"', false)
            ->assertSee('email: "campo@gmail.com"', false);
    }

    public function test_valid_token_changes_the_password(): void
    {
        $user = User::factory()->create(['email' => 'campo@gmail.com']);
        $user->createToken('movil');
        $token = Password::createToken($user);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => 'campo@gmail.com',
            'password' => 'NuevaClave123',
            'password_confirmation' => 'NuevaClave123',
        ])->assertOk()->assertJsonPath('redirect', route('login'));

        $user->refresh();
        $this->assertTrue(Hash::check('NuevaClave123', $user->password));
        $this->assertSame(0, $user->tokens()->count());

        $this->postJson('/login', ['email' => 'campo@gmail.com', 'password' => 'NuevaClave123'])->assertOk();
    }

    public function test_invalid_token_is_rejected_without_changing_password(): void
    {
        $user = User::factory()->create(['email' => 'campo@gmail.com']);

        $this->postJson('/reset-password', [
            'token' => 'token-falso',
            'email' => 'campo@gmail.com',
            'password' => 'NuevaClave123',
            'password_confirmation' => 'NuevaClave123',
        ])->assertStatus(422)->assertJsonValidationErrors('token');

        $this->assertTrue(Hash::check('password', $user->refresh()->password));
    }

    public function test_token_can_only_be_used_once(): void
    {
        $user = User::factory()->create(['email' => 'campo@gmail.com']);
        $token = Password::createToken($user);
        $payload = [
            'token' => $token,
            'email' => 'campo@gmail.com',
            'password' => 'NuevaClave123',
            'password_confirmation' => 'NuevaClave123',
        ];

        $this->postJson('/reset-password', $payload)->assertOk();
        $this->postJson('/reset-password', $payload)->assertStatus(422);
    }

    public function test_reset_requires_matching_confirmation(): void
    {
        $this->postJson('/reset-password', [
            'token' => 'x',
            'email' => 'campo@gmail.com',
            'password' => 'NuevaClave123',
            'password_confirmation' => 'Otra',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
