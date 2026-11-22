<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Notifications\RestablecerContrasena;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CrearAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        Notification::fake();
    }

    public function test_creates_admin_and_new_tenant(): void
    {
        $this->artisan('roya:crear-admin', ['email' => 'Jefa.Coop@gmail.com', '--tenant' => 'Cooperativa Nueva', '--nombre' => 'Jefa Coop'])
            ->expectsOutputToContain('Administrador creado.')
            ->assertSuccessful();

        $tenant = Tenant::query()->where('codigo', 'cooperativa-nueva')->firstOrFail();
        $user = User::query()->where('email', 'jefa.coop@gmail.com')->firstOrFail();

        $this->assertSame('administrador', $user->rolEfectivo());
        $this->assertTrue($user->isAdmin());
        $this->assertSame($tenant->id, $user->tenant_id);
        $this->assertSame('Jefa Coop', $user->name);
        $this->assertNotNull($tenant->codigo_invitacion);
        Notification::assertSentTo($user, RestablecerContrasena::class);
    }

    public function test_shows_invitation_code(): void
    {
        $tenant = Tenant::factory()->create(['nombre' => 'Coop Visible']);

        $this->artisan('roya:crear-admin', ['email' => 've.codigo@gmail.com', '--tenant' => 'Coop Visible'])
            ->expectsTable(['Correo', 'Cooperativa', 'Código de invitación'], [
                ['ve.codigo@gmail.com', 'Coop Visible', $tenant->codigo_invitacion],
            ])
            ->assertSuccessful();

        $this->assertSame(1, Tenant::query()->where('nombre', 'Coop Visible')->count());
    }

    public function test_promotes_existing_user_in_its_tenant(): void
    {
        $user = User::factory()->agricultor()->create(['email' => 'promover@gmail.com']);

        $this->artisan('roya:crear-admin', ['email' => 'promover@gmail.com'])
            ->expectsOutputToContain('Usuario promovido a administrador.')
            ->assertSuccessful();

        $user->refresh();
        $this->assertSame('administrador', $user->rolEfectivo());
        Notification::assertNothingSent();
    }

    public function test_refuses_to_move_user_to_another_tenant(): void
    {
        $user = User::factory()->agricultor()->create(['email' => 'quieto@gmail.com']);
        Tenant::factory()->create(['nombre' => 'Otra Coop', 'codigo' => 'otra-coop']);

        $this->artisan('roya:crear-admin', ['email' => 'quieto@gmail.com', '--tenant' => 'Otra Coop'])->assertFailed();

        $this->assertSame('agricultor', $user->fresh()->rolEfectivo());
    }

    public function test_new_user_requires_tenant(): void
    {
        $this->artisan('roya:crear-admin', ['email' => 'sin.tenant@gmail.com'])->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'sin.tenant@gmail.com']);
    }

    public function test_rejects_non_gmail_email(): void
    {
        $this->artisan('roya:crear-admin', ['email' => 'admin@hotmail.com', '--tenant' => 'X'])->assertFailed();

        $this->assertDatabaseCount('tenants', 0);
    }
}
