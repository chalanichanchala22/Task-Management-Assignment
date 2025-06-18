<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategoriesTableSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        
        $categories = [
            ['name' => 'Work', 'description' => 'Work related tasks'],
            ['name' => 'Personal', 'description' => 'Personal tasks'],
            ['name' => 'Education', 'description' => 'Learning related tasks'],
            ['name' => 'Health', 'description' => 'Health and fitness tasks'],
            ['name' => 'Family', 'description' => 'Family related tasks']
        ];
        
        foreach ($users as $user) {
            foreach ($categories as $category) {
                Category::create([
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'user_id' => $user->id
                ]);
            }
        }
    }
}
