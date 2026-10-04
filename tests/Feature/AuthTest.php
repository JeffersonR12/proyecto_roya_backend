<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_rejects_a_non_gmail_address(): void
    {
        $this->postJson('/login', [
            'email' => 'persona@correo.com',
            'password' => 'ClaveSegura1',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'ClaveIncorrecta1',
        ])->assertStatus(422)->assertJsonValidationErrors('credentials');
    }

    public function test_login_starts_a_session(): void
    {
        $user = User::factory()->create();

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('redirect', route('home'));

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_login_is_limited_to_five_attempts(): void
    {
        $user = User::factory()->create();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/login', [
                'email' => $user->email,
                'password' => 'ClaveIncorrecta1',
            ])->assertStatus(422);
        }

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'ClaveIncorrecta1',
        ])->assertStatus(429);
    }

    public function test_public_registration_always_creates_a_technician(): void
    {
        $this->postJson('/register', [
            'name' => 'Ana Campo',
            'email' => 'ana.campo@gmail.com',
            'role' => 'administrador',
            'password' => 'ClaveSegura1',
            'password_confirmation' => 'ClaveSegura1',
            'terms' => true,
        ])->assertCreated();

        $user = User::query()->where('email', 'ana.campo@gmail.com')->first();

        $this->assertNotNull($user);
        $this->assertSame('tecnico', $user->role);
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_requires_a_mixed_password(): void
    {
        $this->postJson('/register', [
            'name' => 'Ana Campo',
            'email' => 'ana.campo@gmail.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'terms' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_password_reset_updates_the_password(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/forgot-password', [
            'email' => $user->email,
        ])->assertOk()->assertJsonMissingPath('reset_url');

        Notification::assertSentTo($user, ResetPasswordNotification::class);

        $token = Password::broker()->createToken($user);

        $this->postJson('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'ClaveNueva1',
            'password_confirmation' => 'ClaveNueva1',
        ])->assertOk()->assertJsonPath('redirect', route('login'));

        $this->assertTrue(Hash::check('ClaveNueva1', $user->fresh()->password));
    }

    public function test_authenticated_user_is_redirected_away_from_login(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/login')->assertRedirect(route('home'));
    }
}
