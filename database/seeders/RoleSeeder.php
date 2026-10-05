<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['nombre' => 'agricultor', 'descripcion' => 'Captura e inferencia en campo'],
            ['nombre' => 'tecnico', 'descripcion' => 'Validacion tecnica y seguimiento de parcelas'],
            ['nombre' => 'administrador', 'descripcion' => 'Gestion del tenant, catalogo y usuarios'],
        ] as $role) {
            Role::query()->updateOrCreate(['nombre' => $role['nombre']], $role);
        }
    }
}
