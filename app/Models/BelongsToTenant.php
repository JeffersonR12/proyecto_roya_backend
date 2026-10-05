<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::creating(function (Model $model): void {
            if (! $model->tenant_id && Auth::user()?->tenant_id) {
                $model->tenant_id = Auth::user()->tenant_id;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder): void {
            $tenantId = Auth::user()?->tenant_id;

            if ($tenantId) {
                $builder->where($builder->getModel()->getTable().'.tenant_id', $tenantId);
            }
        });
    }
}
