<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->company(),
            'codigo' => fake()->unique()->slug(2),
            'activo' => true,
        ];
    }
}
