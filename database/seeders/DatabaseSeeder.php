<?php

namespace Database\Seeders;

use App\Models\Parcela;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CatalogoFitosanitarioSeeder::class,
        ]);

        $tenant = Tenant::query()->updateOrCreate(
            ['codigo' => 'el-roble'],
            [
                'nombre' => 'Cooperativa El Roble',
                'activo' => true,
            ]
        );

        $this->upsertUser($tenant->id, 'admin@gmail.com', [
            'name' => 'Ana Rios',
            'role' => 'administrador',
            'phone' => '3105550101',
            'organization' => 'Cooperativa El Roble',
        ]);

        $tecnico = $this->upsertUser($tenant->id, 'tecnico@gmail.com', [
            'name' => 'Luis Mora',
            'role' => 'tecnico',
            'phone' => '3205550199',
            'organization' => 'Finca La Esperanza',
        ]);

        $this->upsertUser($tenant->id, 'agricultor@gmail.com', [
            'name' => 'Maria Quispe',
            'role' => 'agricultor',
            'phone' => '3005550188',
            'organization' => 'Cooperativa El Roble',
        ]);

        Parcela::query()->updateOrCreate(
            [
                'tenant_id' => $tenant->id,
                'nombre' => 'Lote Valle Norte',
            ],
            [
                'usuario_id' => $tecnico->id,
                'latitud' => -11.9200000,
                'longitud' => -75.3100000,
                'area_hectareas' => 2.50,
                'cultivo' => 'trigo',
            ]
        );
    }

    private function upsertUser(int $tenantId, string $email, array $attributes): User
    {
        $role = Role::query()->where('nombre', $attributes['role'])->firstOrFail();

        $user = User::query()->where('email', $email)->first() ?? new User(['email' => $email]);
        $user->fill([
            ...$attributes,
            'tenant_id' => $tenantId,
            'rol_id' => $role->id,
            'activo' => true,
            'password' => 'password',
        ])->save();

        return $user;
    }
}
