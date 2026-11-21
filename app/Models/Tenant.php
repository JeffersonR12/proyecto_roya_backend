<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    /** Sin 0/O ni 1/I/L para que el codigo se pueda dictar por telefono sin errores. */
    public const ALFABETO_INVITACION = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public const LONGITUD_INVITACION = 10;

    /**
     * codigo_invitacion queda fuera a proposito: solo se asigna con
     * regenerarCodigoInvitacion(), nunca por asignacion masiva.
     */
    protected $fillable = [
        'nombre',
        'codigo',
        'activo',
    ];

    protected $hidden = [
        'codigo_invitacion',
    ];

    protected static function booted(): void
    {
        static::creating(function (Tenant $tenant): void {
            if (! $tenant->codigo_invitacion) {
                $tenant->codigo_invitacion = static::nuevoCodigoInvitacion();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * Codigo aleatorio criptograficamente seguro (random_int) y unico en la tabla.
     */
    public static function nuevoCodigoInvitacion(): string
    {
        $max = strlen(self::ALFABETO_INVITACION) - 1;

        do {
            $codigo = '';

            for ($i = 0; $i < self::LONGITUD_INVITACION; $i++) {
                $codigo .= self::ALFABETO_INVITACION[random_int(0, $max)];
            }
        } while (static::query()->where('codigo_invitacion', $codigo)->exists());

        return $codigo;
    }

    /**
     * Invalida el codigo anterior: quien lo tenga ya no podra registrarse.
     */
    public function regenerarCodigoInvitacion(): string
    {
        $this->forceFill(['codigo_invitacion' => static::nuevoCodigoInvitacion()])->save();

        return $this->codigo_invitacion;
    }

    public static function normalizarCodigoInvitacion(?string $codigo): string
    {
        return strtoupper(preg_replace('/[\s-]+/', '', (string) $codigo) ?? '');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(Parcela::class);
    }

    public function diagnosticos(): HasMany
    {
        return $this->hasMany(Diagnostico::class);
    }
}
