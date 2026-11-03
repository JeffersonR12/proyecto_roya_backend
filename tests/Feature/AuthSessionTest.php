<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_page_is_reachable(): void
    {
        $this->get('/register')->assertOk();
    }

    public function test_register_rejects_non_gmail_email(): void
    {
        $response = $this->postJson('/register', $this->validRegisterPayload([
            'email' => 'usuario@hotmail.com',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors('email');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'usuario@hotmail.com']);
    }

    public function test_register_creates_agricultor_with_tenant(): void
    {
        $response = $this->postJson('/register', $this->validRegisterPayload());

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'ana.campo@gmail.com',
            'role' => 'agricultor',
            'phone' => '+51987654321',
        ]);
        $this->assertDatabaseHas('tenants', [
            'codigo' => 'cooperativa-el-roble',
        ]);
        $this->assertDatabaseHas('roles', [
            'nombre' => 'agricultor',
        ]);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'ana.campo@gmail.com']);

        $response = $this->postJson('/register', $this->validRegisterPayload());

        $response->assertStatus(422)->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_register_rejects_non_peruvian_phone(): void
    {
        $response = $this->postJson('/register', $this->validRegisterPayload([
            'phone' => '123456789',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors('phone');
        $this->assertGuest();
    }

    public function test_register_normalizes_national_peru_phone(): void
    {
        $response = $this->postJson('/register', $this->validRegisterPayload([
            'phone' => '987 654 321',
        ]));

        $response->assertCreated();
        $this->assertDatabaseHas('users', [
            'email' => 'ana.campo@gmail.com',
            'phone' => '+51987654321',
        ]);
    }

    public function test_forgot_password_returns_generic_message(): void
    {
        User::factory()->create(['email' => 'existe.reset@gmail.com']);

        $missing = $this->postJson('/forgot-password', [
            'email' => 'no.existe.reset@gmail.com',
        ]);
        $existing = $this->postJson('/forgot-password', [
            'email' => 'existe.reset@gmail.com',
        ]);

        $missing->assertOk();
        $existing->assertOk();
        $this->assertSame($missing->json('message'), $existing->json('message'));
        $this->assertStringContainsStringIgnoringCase('si el correo existe', (string) $existing->json('message'));
        $this->assertStringNotContainsStringIgnoringCase('no registrado', (string) $existing->getContent());
    }

    public function test_logout_invalidates_the_session(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/logout');

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertGuest();
    }

    public function test_login_normalizes_gmail_to_lowercase(): void
    {
        User::factory()->create([
            'email' => 'qa.case@gmail.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/login', [
            'email' => 'QA.CASE@gmail.com',
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertAuthenticated();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validRegisterPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ana Campo',
            'email' => 'ana.campo@gmail.com',
            'password' => 'password1',
            'password_confirmation' => 'password1',
            'role' => 'agricultor',
            'organization' => 'Cooperativa El Roble',
            'phone' => '+51987654321',
            'terms' => '1',
        ], $overrides);
    }
}
