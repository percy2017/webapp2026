<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(PeluqueriaTemplateSeeder::class);
        // StreamingTemplateSeeder runs last so its template is the active one.
        $this->call(StreamingTemplateSeeder::class);

        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('Admin2026$'),
                'email_verified_at' => now(),
            ],
        );
        $admin->assignRole('admin');
    }
}
