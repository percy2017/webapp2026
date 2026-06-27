<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

class ChatPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Chat $chat): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Chat $chat): bool
    {
        return true;
    }

    public function delete(User $user, Chat $chat): bool
    {
        return $user->hasRole('admin');
    }
}
