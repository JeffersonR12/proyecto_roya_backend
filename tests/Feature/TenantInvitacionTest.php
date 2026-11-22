<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantInvitacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_admin_sees_its_own_tenant_code(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->getJson('/api/tenant/invitacion')
            ->assertOk()
            ->assertJsonPath('codigo_invitacion', $admin->tenant->codigo_invitacion);
    }

    public function test_admin_regenerates_code_and_old_one_stops_working(): void
    {
        $admin = User::factory()->admin()->create();
        $anterior = $admin->tenant->codigo_invitacion;

        $nuevo = $this->actingAs($admin)->postJson('/api/tenant/invitacion/regenerar')
            ->assertOk()
            ->json('codigo_invitacion');

        $this->assertNotSame($anterior, $nuevo);
        $this->assertSame($nuevo, $admin->tenant->fresh()->codigo_invitacion);

        auth()->logout();

        $this->postJson('/register', [
            'name' => 'Tarde',
            'email' => 'tarde@gmail.com',
            'phone' => '987654321',
            'password' => 'password1',
            'password_confirmation' => 'password1',
            'codigo_invitacion' => $anterior,
            'terms' => '1',
        ])->assertStatus(422)->assertJsonValidationErrors('codigo_invitacion');
    }

    public function test_non_admins_cannot_see_or_regenerate_code(): void
    {
        $tecnico = User::factory()->create();
        $agricultor = User::factory()->agricultor()->create();

        foreach ([$tecnico, $agricultor] as $user) {
            $codigo = $user->tenant->codigo_invitacion;

            $this->actingAs($user)->getJson('/api/tenant/invitacion')->assertForbidden();
            $this->actingAs($user)->postJson('/api/tenant/invitacion/regenerar')->assertForbidden();
            $this->assertSame($codigo, $user->tenant->fresh()->codigo_invitacion);
        }
    }

    public function test_legacy_role_column_does_not_grant_admin(): void
    {
        $user = User::factory()->agricultor()->create(['role' => 'administrador']);

        $this->actingAs($user)->getJson('/api/tenant/invitacion')->assertForbidden();
    }

    public function test_admin_only_regenerates_its_own_tenant(): void
    {
        $admin = User::factory()->admin()->create();
        $otro = Tenant::factory()->create();
        $codigoOtro = $otro->codigo_invitacion;

        $this->actingAs($admin)->postJson('/api/tenant/invitacion/regenerar', ['tenant_id' => $otro->id])->assertOk();

        $this->assertSame($codigoOtro, $otro->fresh()->codigo_invitacion);
    }

    public function test_guest_cannot_access_code(): void
    {
        $this->getJson('/api/tenant/invitacion')->assertUnauthorized();
    }
}
