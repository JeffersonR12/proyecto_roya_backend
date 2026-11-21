<?php

namespace App\Models;

use App\Notifications\RestablecerContrasena;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'tenant_id',
        'rol_id',
        'activo',
        'name',
        'email',
        'password',
        'role',
        'phone',
        'organization',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(Parcela::class, 'usuario_id');
    }

    public function diagnosticos(): HasMany
    {
        return $this->hasMany(Diagnostico::class, 'usuario_id');
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(Analysis::class);
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new RestablecerContrasena($token));
    }

    public function isAdmin(): bool
    {
        return $this->rol?->nombre === 'administrador' || $this->role === 'administrador';
    }

    /**
     * Rol efectivo para autorizacion. Sin rol asignado se trata como
     * agricultor (el menor privilegio), nunca como tecnico.
     */
    public function rolEfectivo(): string
    {
        return $this->rol?->nombre ?? $this->role ?? 'agricultor';
    }

    /**
     * Datos minimos del usuario que necesita la PWA. El rol sale de la tabla
     * roles (rolEfectivo), nunca de la columna legacy users.role.
     *
     * @return array{id: int, name: string, email: string, tenant_id: int|null, organization: string|null, role: string, rol: array{nombre: string}}
     */
    public function toClientArray(): array
    {
        $rol = $this->rolEfectivo();

        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'email' => (string) $this->email,
            'tenant_id' => $this->tenant_id === null ? null : (int) $this->tenant_id,
            'organization' => $this->tenant?->nombre ?? $this->organization,
            'role' => $rol,
            'rol' => ['nombre' => $rol],
        ];
    }

    public function isStaff(): bool
    {
        return in_array($this->rolEfectivo(), ['tecnico', 'administrador'], true);
    }

    public function roleName(): string
    {
        return $this->rol?->nombre ?? $this->role ?? 'tecnico';
    }
}
