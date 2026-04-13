<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        Product::create([ 'name'=>'1 Set Baju Bodo Merah', 'slug'=>'bodo-merah', 'description'=>'Baju bodo khas', 'price'=>250000, 'stock'=>10, 'image'=>null]);
        Product::create([ 'name'=>'1 Set Baju Bodo Hitam', 'slug'=>'bodo-hitam', 'description'=>'Baju bodo elegan', 'price'=>300000, 'stock'=>8, 'image'=>null]);
    }
}
