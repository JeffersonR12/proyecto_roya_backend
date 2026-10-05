<?php

namespace Database\Factories;

use App\Models\Diagnostico;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Diagnostico>
 */
class DiagnosticoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid_local' => (string) Str::uuid(),
            'usuario_id' => User::factory(),
            'tenant_id' => fn (array $attributes) => User::query()->find($attributes['usuario_id'])->tenant_id,
            'parcela_id' => null,
            'catalogo_id' => null,
            'clase' => 'roya_amarilla',
            'confianza' => 94.50,
            'severidad' => 23.70,
            'imagen_path' => 'diagnosticos/ejemplo.jpg',
            'modelo_version' => '1.0.0',
            'captured_at' => now(),
            'sync_status' => 'confirmed',
        ];
    }
}
