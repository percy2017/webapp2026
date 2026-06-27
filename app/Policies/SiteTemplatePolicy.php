<?php

namespace App\Policies;

use App\Models\SiteTemplate;
use App\Models\User;

class SiteTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('manage-templates');
    }

    public function view(User $user, SiteTemplate $template): bool
    {
        return $user->can('manage-templates');
    }

    public function create(User $user): bool
    {
        return $user->can('manage-templates');
    }

    public function update(User $user, SiteTemplate $template): bool
    {
        return $user->can('manage-templates');
    }

    public function delete(User $user, SiteTemplate $template): bool
    {
        return $user->can('manage-templates');
    }

    public function activate(User $user, SiteTemplate $template): bool
    {
        return $user->can('manage-templates');
    }
}
