<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $role = Role::query()->firstOrCreate(
            ['nombre' => 'tecnico'],
            ['descripcion' => 'Tecnico agricola']
        );

        return [
            'tenant_id' => Tenant::factory(),
            'rol_id' => $role->id,
            'activo' => true,
            'name' => fake()->name(),
            'email' => fake()->unique()->numerify('usuario########').'@gmail.com',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'tecnico',
            'phone' => fake()->numerify('3#########'),
            'organization' => fake()->company(),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(function (array $attributes) {
            $role = Role::query()->firstOrCreate(
                ['nombre' => 'administrador'],
                ['descripcion' => 'Administrador del tenant']
            );

            return [
                'rol_id' => $role->id,
                'role' => 'administrador',
            ];
        });
    }
}
