<?php

namespace App\Policies;

use App\Models\Diagnostico;
use App\Models\User;

class DiagnosticoPolicy
{
    public function view(User $user, Diagnostico $diagnostico): bool
    {
        if ((int) $diagnostico->tenant_id !== (int) $user->tenant_id) {
            return false;
        }

        return $user->isStaff() || (int) $diagnostico->usuario_id === (int) $user->id;
    }

    public function review(User $user, Diagnostico $diagnostico): bool
    {
        return $user->isStaff() && (int) $diagnostico->tenant_id === (int) $user->tenant_id;
    }
}
