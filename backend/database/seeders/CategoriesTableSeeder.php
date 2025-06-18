<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategoriesTableSeeder extends Seeder
{
    public function run()
    {
        // Create some example categories
        $categories = ['Work', 'Personal', 'Urgent', 'Learning', 'Other'];

        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}
