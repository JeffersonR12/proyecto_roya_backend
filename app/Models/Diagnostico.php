<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Diagnostico extends Model
{
    use BelongsToTenant, HasFactory;

    public const CLASES = [
        'sana',
        'roya_amarilla',
        'otra_enfermedad',
        'no_concluyente',
    ];

    public const UMBRAL_CONFIANZA = 75;

    protected $fillable = [
        'uuid_local',
        'tenant_id',
        'usuario_id',
        'parcela_id',
        'catalogo_id',
        'clase',
        'confianza',
        'severidad',
        'latitud',
        'longitud',
        'imagen_path',
        'mascara_path',
        'modelo_version',
        'captured_at',
        'synced_at',
        'sync_status',
    ];

    protected function casts(): array
    {
        return [
            'confianza' => 'decimal:2',
            'severidad' => 'decimal:2',
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'captured_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Diagnostico $diagnostico): void {
            if (! $diagnostico->uuid_local) {
                $diagnostico->uuid_local = (string) Str::uuid();
            }

            if ((float) $diagnostico->confianza < self::UMBRAL_CONFIANZA) {
                $diagnostico->clase = 'no_concluyente';
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function parcela(): BelongsTo
    {
        return $this->belongsTo(Parcela::class);
    }

    public function catalogo(): BelongsTo
    {
        return $this->belongsTo(CatalogoFitosanitario::class, 'catalogo_id');
    }

    public function alertas(): HasMany
    {
        return $this->hasMany(Alerta::class);
    }
}
