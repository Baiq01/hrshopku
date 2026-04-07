<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TailorUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Penjahit',
            'email' => 'tailor@hrshopku.test',
            'password' => Hash::make('password'),
            'is_admin' => false,
            'role' => 'tailor',
        ]);
    }
}
