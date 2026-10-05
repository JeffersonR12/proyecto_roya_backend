<?php

namespace Database\Seeders;

use App\Models\CatalogoFitosanitario;
use Illuminate\Database\Seeder;

class CatalogoFitosanitarioSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'codigo' => 'PHY-000',
                'nombre' => 'Sana',
                'agente_causal' => 'Estado sin enfermedad detectada',
                'cultivo' => 'trigo',
                'sintomas' => 'Hoja sin signos compatibles con las clases de enfermedad consideradas.',
                'recomendaciones' => 'Mantener plan preventivo.',
                'severidad_base' => 0,
                'umbral_alerta' => 10,
            ],
            [
                'codigo' => 'PHY-001',
                'nombre' => 'Roya Amarilla',
                'agente_causal' => 'Puccinia striiformis',
                'cultivo' => 'trigo',
                'sintomas' => 'Estrias amarillas en las hojas.',
                'recomendaciones' => 'Cuarentena del lote y seguimiento tecnico.',
                'severidad_base' => 20,
                'umbral_alerta' => 30,
            ],
            [
                'codigo' => 'PHY-002',
                'nombre' => 'Roya de la Hoja',
                'agente_causal' => 'Puccinia triticina',
                'cultivo' => 'trigo',
                'sintomas' => null,
                'recomendaciones' => null,
                'severidad_base' => null,
                'umbral_alerta' => 30,
            ],
            [
                'codigo' => 'PHY-003',
                'nombre' => 'Roya del Tallo',
                'agente_causal' => 'Puccinia graminis',
                'cultivo' => 'trigo',
                'sintomas' => null,
                'recomendaciones' => null,
                'severidad_base' => null,
                'umbral_alerta' => 30,
            ],
            [
                'codigo' => 'PHY-004',
                'nombre' => 'Oidio',
                'agente_causal' => 'Blumeria graminis',
                'cultivo' => 'trigo',
                'sintomas' => null,
                'recomendaciones' => null,
                'severidad_base' => null,
                'umbral_alerta' => 30,
            ],
            [
                'codigo' => 'PHY-005',
                'nombre' => 'Septoriosis',
                'agente_causal' => 'Septoria tritici',
                'cultivo' => 'trigo',
                'sintomas' => null,
                'recomendaciones' => null,
                'severidad_base' => null,
                'umbral_alerta' => 30,
            ],
        ];

        foreach ($items as $item) {
            CatalogoFitosanitario::query()->updateOrCreate(
                ['codigo' => $item['codigo']],
                $item
            );
        }
    }
}
