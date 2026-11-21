<?php

namespace Tests\Feature;

use App\Models\Diagnostico;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Support\AuthRules;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * T-04 / T-05: el registro publico no puede dar privilegios ni meter a
 * nadie en una cooperativa sin su codigo de invitacion.
 */
class AuthRegistroSeguroTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->tenant = Tenant::factory()->create(['nombre' => 'Cooperativa Valle']);
    }

    public function test_tenant_receives_an_invitation_code_on_create(): void
    {
        $this->assertMatchesRegularExpression('/^[A-HJKMNP-Z2-9]{10}$/', (string) $this->tenant->codigo_invitacion);
        $this->assertArrayNotHasKey('codigo_invitacion', $this->tenant->toArray());
    }

    public function test_register_with_role_administrador_creates_agricultor(): void
    {
        $this->postJson('/register', $this->payload([
            'role' => 'administrador',
            'rol_id' => 999,
            'tenant_id' => 999,
        ]))->assertCreated();

        $user = User::query()->where('email', 'nuevo.campo@gmail.com')->firstOrFail();

        $this->assertSame('agricultor', $user->rolEfectivo());
        $this->assertSame('agricultor', $user->role);
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isStaff());
        $this->assertSame($this->tenant->id, $user->tenant_id);
    }

    public function test_register_never_creates_tenants_or_roles(): void
    {
        $tenants = Tenant::query()->count();
        $roles = Role::query()->count();

        $this->postJson('/register', $this->payload([
            'organization' => 'Cooperativa Inventada',
            'role' => 'superadmin',
        ]))->assertCreated();

        $this->assertSame($tenants, Tenant::query()->count());
        $this->assertSame($roles, Role::query()->count());
    }

    public function test_register_requires_invitation_code(): void
    {
        $this->postJson('/register', $this->payload(['codigo_invitacion' => '']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('codigo_invitacion');

        $this->assertGuest();
    }

    public function test_unknown_invitation_code_is_rejected(): void
    {
        $this->postJson('/register', $this->payload(['codigo_invitacion' => 'NOEXISTE22']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('codigo_invitacion');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'nuevo.campo@gmail.com']);
    }

    public function test_invitation_code_of_inactive_tenant_is_rejected(): void
    {
        $inactivo = Tenant::factory()->create(['activo' => false]);

        $this->postJson('/register', $this->payload(['codigo_invitacion' => $inactivo->codigo_invitacion]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('codigo_invitacion');

        $this->assertGuest();
    }

    public function test_tenant_slug_is_not_accepted_as_invitation_code(): void
    {
        $this->postJson('/register', $this->payload(['codigo_invitacion' => $this->tenant->codigo]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('codigo_invitacion');
    }

    public function test_invitation_code_is_normalized(): void
    {
        $codigo = strtolower(substr($this->tenant->codigo_invitacion, 0, 5).' - '.substr($this->tenant->codigo_invitacion, 5));

        $this->postJson('/register', $this->payload(['codigo_invitacion' => $codigo]))->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'nuevo.campo@gmail.com', 'tenant_id' => $this->tenant->id]);
    }

    public function test_registered_user_only_sees_its_tenant_data(): void
    {
        $otro = User::factory()->create();
        $ajeno = Diagnostico::factory()->create(['usuario_id' => $otro->id, 'tenant_id' => $otro->tenant_id]);

        $this->postJson('/register', $this->payload())->assertCreated();

        $user = User::query()->where('email', 'nuevo.campo@gmail.com')->firstOrFail();
        $propio = Diagnostico::factory()->create(['usuario_id' => $user->id, 'tenant_id' => $user->tenant_id]);

        $this->assertSame($this->tenant->id, $user->tenant_id);
        $this->assertNotEquals($otro->tenant_id, $user->tenant_id);

        $response = $this->getJson('/api/diagnosticos')->assertOk();

        $response->assertJsonPath('meta.tenant_id', $this->tenant->id);
        $uuids = collect($response->json('data'))->pluck('uuid_local');
        $this->assertTrue($uuids->contains($propio->uuid_local));
        $this->assertFalse($uuids->contains($ajeno->uuid_local));

        $this->getJson('/api/diagnosticos/'.$ajeno->uuid_local.'/imagen')->assertNotFound();
    }

    public function test_register_is_rate_limited_per_ip(): void
    {
        for ($i = 0; $i < AuthRules::PUBLIC_FORM_ATTEMPTS; $i++) {
            $this->postJson('/register', $this->payload(['codigo_invitacion' => 'NOEXISTE22']))->assertStatus(422);
        }

        $this->postJson('/register', $this->payload())->assertStatus(429);
        $this->assertDatabaseMissing('users', ['email' => 'nuevo.campo@gmail.com']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Nuevo Campo',
            'email' => 'nuevo.campo@gmail.com',
            'phone' => '987654321',
            'password' => 'password1',
            'password_confirmation' => 'password1',
            'codigo_invitacion' => $this->tenant->codigo_invitacion,
            'terms' => '1',
        ], $overrides);
    }
}
