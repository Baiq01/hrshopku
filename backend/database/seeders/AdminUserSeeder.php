<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@hrshopku.test',
            'password' => Hash::make('password'),
            'is_admin' => true,
            'role' => 'admin',
        ]);
    }
}
