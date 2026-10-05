<?php

namespace App\Models;

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

    public function isAdmin(): bool
    {
        return $this->rol?->nombre === 'administrador' || $this->role === 'administrador';
    }

    public function roleName(): string
    {
        return $this->rol?->nombre ?? $this->role ?? 'tecnico';
    }
}
