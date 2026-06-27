<?php

namespace App\Policies;

use App\Models\SiteMenuItem;
use App\Models\User;

class SiteMenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('manage-settings');
    }

    public function create(User $user): bool
    {
        return $user->can('manage-settings');
    }

    public function update(User $user, SiteMenuItem $item): bool
    {
        return $user->can('manage-settings');
    }

    public function delete(User $user, SiteMenuItem $item): bool
    {
        return $user->can('manage-settings');
    }
}
