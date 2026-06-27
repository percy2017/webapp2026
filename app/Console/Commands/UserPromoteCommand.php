<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

#[Signature('user:promote {email : Email del usuario a promover}')]
#[Description('Asigna el rol admin (con todos los permisos) a un usuario.')]
class UserPromoteCommand extends Command
{
    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No existe un usuario con email: {$email}");

            return self::FAILURE;
        }

        $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $permissions = Permission::all();
        if ($permissions->isNotEmpty()) {
            $role->syncPermissions($permissions);
        }

        $user->assignRole($role);

        $this->info("✓ Usuario {$user->email} promovido a admin.");
        $this->info('  Roles: '.$user->fresh()->roles->pluck('name')->implode(', '));
        $this->info('  Permisos: '.$user->fresh()->getAllPermissions()->pluck('name')->implode(', '));

        return self::SUCCESS;
    }
}
