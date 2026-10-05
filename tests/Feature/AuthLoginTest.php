<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\AuthRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_reachable(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_non_gmail_email_is_rejected(): void
    {
        $response = $this->postJson('/login', [
            'email' => 'usuario@hotmail.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_invalid_credentials_return_generic_error(): void
    {
        User::factory()->create([
            'email' => 'qa.login@gmail.com',
            'password' => 'password',
        ]);

        $missing = $this->postJson('/login', [
            'email' => 'no.existe@gmail.com',
            'password' => 'password',
        ]);

        $wrong = $this->postJson('/login', [
            'email' => 'qa.login@gmail.com',
            'password' => 'incorrecta',
        ]);

        $missing->assertStatus(422)->assertJsonValidationErrors('credentials');
        $wrong->assertStatus(422)->assertJsonValidationErrors('credentials');

        $this->assertSame(
            $missing->json('errors.credentials.0'),
            $wrong->json('errors.credentials.0')
        );
        $this->assertSame('Las credenciales no son validas.', $wrong->json('errors.credentials.0'));
        $this->assertStringNotContainsStringIgnoringCase('existe', (string) $wrong->getContent());
        $this->assertGuest();
    }

    public function test_gmail_user_can_log_in(): void
    {
        User::factory()->create([
            'email' => 'qa.ok@gmail.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'qa.ok@gmail.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertAuthenticated();
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        User::factory()->create([
            'email' => 'qa.throttle@gmail.com',
            'password' => 'password',
        ]);

        for ($i = 0; $i < AuthRules::LOGIN_ATTEMPTS; $i++) {
            $this->postJson('/login', [
                'email' => 'qa.throttle@gmail.com',
                'password' => 'incorrecta',
            ])->assertStatus(422);
        }

        $this->postJson('/login', [
            'email' => 'qa.throttle@gmail.com',
            'password' => 'incorrecta',
        ])->assertStatus(429);

        $this->assertGuest();
    }
}
