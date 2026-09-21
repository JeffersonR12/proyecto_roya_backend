<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::query()->whereIn('email', [
            'admin@royaguard.test',
            'tecnico@royaguard.test',
        ])->delete();

        User::query()->updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Ana Rios',
                'password' => 'password',
                'role' => 'administrador',
                'phone' => '3105550101',
                'organization' => 'Cooperativa El Roble',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'tecnico@gmail.com'],
            [
                'name' => 'Luis Mora',
                'password' => 'password',
                'role' => 'tecnico',
                'phone' => '3205550199',
                'organization' => 'Finca La Esperanza',
            ]
        );
    }
}
