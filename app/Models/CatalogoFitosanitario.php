<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogoFitosanitario extends Model
{
    use HasFactory;

    protected $table = 'catalogo_fitosanitario';

    protected $fillable = [
        'codigo',
        'nombre',
        'agente_causal',
        'cultivo',
        'sintomas',
        'recomendaciones',
        'severidad_base',
        'umbral_alerta',
        'imagen_referencia',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'severidad_base' => 'decimal:2',
            'umbral_alerta' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    public function diagnosticos(): HasMany
    {
        return $this->hasMany(Diagnostico::class, 'catalogo_id');
    }
}
