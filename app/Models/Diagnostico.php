<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Diagnostico extends Model
{
    use BelongsToTenant, HasFactory, SoftDeletes;

    public const CLASES = [
        'sana',
        'roya_amarilla',
        'otra_enfermedad',
        'no_concluyente',
    ];

    public const UMBRAL_CONFIANZA = 75;

    public const HITL_STATUSES = [
        'pending',
        'validated',
        'rejected',
        'resample',
        'not_required',
    ];

    /** Codigo del catalogo fitosanitario asociado a cada clase del modelo. */
    public const CATALOGO_POR_CLASE = [
        'sana' => 'PHY-000',
        'roya_amarilla' => 'PHY-001',
    ];

    protected $fillable = [
        'uuid_local',
        'tenant_id',
        'usuario_id',
        'parcela_id',
        'catalogo_id',
        'clase',
        'confianza',
        'severidad',
        'scores',
        'latitud',
        'longitud',
        'imagen_path',
        'mascara_path',
        'modelo_version',
        'captured_at',
        'synced_at',
        'sync_status',
        'hitl_status',
        'etiqueta_humana',
    ];

    protected function casts(): array
    {
        return [
            'confianza' => 'decimal:2',
            'severidad' => 'decimal:2',
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'scores' => 'array',
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

            $diagnostico->clase = self::claseEfectiva($diagnostico->clase, $diagnostico->confianza);
        });
    }

    /** Confianza < umbral => no_concluyente. Nunca se afirma un diagnostico debil. */
    public static function claseEfectiva(?string $clase, mixed $confianza): string
    {
        if ((float) $confianza < self::UMBRAL_CONFIANZA) {
            return 'no_concluyente';
        }

        return $clase ?: 'no_concluyente';
    }

    /**
     * RBAC sobre el tenant (ya filtrado por BelongsToTenant):
     * agricultor => solo sus diagnosticos; tecnico/administrador => el tenant completo.
     */
    public function scopeVisiblePara(Builder $query, User $user): Builder
    {
        $query->where($this->getTable().'.tenant_id', $user->tenant_id);

        if (! $user->isStaff()) {
            $query->where($this->getTable().'.usuario_id', $user->id);
        }

        return $query;
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
