<?php

namespace App\Policies;

use App\Models\User;

class SiteSettingPolicy
{
    public function view(User $user): bool
    {
        return $user->can('manage-settings');
    }

    public function update(User $user): bool
    {
        return $user->can('manage-settings');
    }
}
