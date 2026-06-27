<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Spatie\Permission\Models\Role;

class AssignAdminRoleOnFirstRegistration
{
    public function handle(Registered $event): void
    {
        $user = $event->user;

        if (! $user instanceof User) {
            return;
        }

        $hasAnyAdmin = Role::where('name', 'admin')->where('guard_name', 'web')->exists()
            && User::role('admin')->exists();

        if (! $hasAnyAdmin) {
            $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
            $user->assignRole($admin);
        }
    }
}
