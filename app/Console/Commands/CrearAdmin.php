<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Support\AuthRules;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Unica via para crear administradores: el registro publico solo crea
 * agricultores. Un usuario nuevo recibe una clave aleatoria y un enlace de
 * restablecimiento por correo para definir la suya; nunca se imprime una clave.
 */
class CrearAdmin extends Command
{
    protected $signature = 'roya:crear-admin
        {email : Correo Gmail del administrador}
        {--tenant= : Nombre o codigo de la cooperativa (se crea si no existe)}
        {--nombre= : Nombre visible si el usuario es nuevo}';

    protected $description = 'Crea o promueve un usuario a administrador de su cooperativa y muestra el código de invitación';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $opcionTenant = trim((string) $this->option('tenant'));
        $rol = Role::query()->where('nombre', 'administrador')->first();
        $user = User::query()->where('email', $email)->first();
        $tenant = $opcionTenant !== '' ? $this->buscarTenant($opcionTenant) : $user?->tenant;

        $error = $this->validar($email, $opcionTenant, $rol, $user, $tenant);

        if ($error !== null) {
            $this->error($error);

            return self::FAILURE;
        }

        $esNuevo = $user === null;

        [$user, $tenant] = DB::transaction(function () use ($user, $tenant, $opcionTenant, $email, $rol) {
            $tenant ??= Tenant::query()->create([
                'nombre' => $opcionTenant,
                'codigo' => Str::slug($opcionTenant),
                'activo' => true,
            ]);

            $user ??= new User([
                'email' => $email,
                'name' => trim((string) $this->option('nombre')) ?: Str::before($email, '@'),
                'password' => Str::password(32),
            ]);

            $user->forceFill([
                'tenant_id' => $tenant->id,
                'rol_id' => $rol->id,
                'role' => 'administrador',
                'organization' => $tenant->nombre,
                'activo' => true,
            ])->save();

            return [$user, $tenant];
        });

        if (! $tenant->activo) {
            $this->warn('La cooperativa está inactiva: nadie podrá registrarse con su código hasta activarla.');
        }

        $this->info($esNuevo ? 'Administrador creado.' : 'Usuario promovido a administrador.');
        $this->table(['Correo', 'Cooperativa', 'Código de invitación'], [
            [$user->email, $tenant->nombre, $tenant->codigo_invitacion],
        ]);

        if ($esNuevo) {
            $estado = Password::sendResetLink(['email' => $user->email]);

            $estado === Password::RESET_LINK_SENT
                ? $this->line('Se envió un enlace a '.$user->email.' para que defina su contraseña.')
                : $this->warn('No se pudo enviar el enlace. Pide que use "¿Olvidaste tu contraseña?" en /forgot-password.');
        }

        return self::SUCCESS;
    }

    private function validar(string $email, string $opcionTenant, ?Role $rol, ?User $user, ?Tenant $tenant): ?string
    {
        $mismaCooperativa = $user?->tenant_id === null || $tenant === null
            || (int) $user->tenant_id === (int) $tenant->id;

        return match (true) {
            ! preg_match(AuthRules::GMAIL_PATTERN, $email) => 'El correo debe tener el formato usuario@gmail.com.',
            $rol === null => 'No existe el rol administrador. Ejecuta: php artisan db:seed --class=RoleSeeder',
            $opcionTenant === '' && $tenant === null => $user === null
                ? 'Para un usuario nuevo indica la cooperativa con --tenant="Nombre de la cooperativa".'
                : 'El usuario no tiene cooperativa. Indícala con --tenant="Nombre de la cooperativa".',
            // Mover un usuario de cooperativa arrastraria sus diagnosticos: se hace a mano, no aqui.
            ! $mismaCooperativa => "El usuario ya pertenece a la cooperativa \"{$user->tenant?->nombre}\". No se cambia de cooperativa desde este comando.",
            $tenant === null && Str::slug($opcionTenant) === '' => 'El nombre de la cooperativa no es válido.',
            default => null,
        };
    }

    private function buscarTenant(string $valor): ?Tenant
    {
        return Tenant::query()
            ->where('codigo', Str::slug($valor))
            ->orWhere('nombre', $valor)
            ->first();
    }
}
