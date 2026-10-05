<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyncEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'uuid_local',
        'estado',
        'intentos',
        'ultimo_error',
    ];

    protected function casts(): array
    {
        return [
            'intentos' => 'integer',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
