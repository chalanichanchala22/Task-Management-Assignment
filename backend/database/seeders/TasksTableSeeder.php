<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\User;
use App\Models\Category;

class TasksTableSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        $categories = Category::all();

        // For each user, create 3 tasks, each assigned a random category
        foreach ($users as $user) {
            for ($i = 0; $i < 3; $i++) {
                Task::create([
                    'user_id' => $user->id,
                    'category_id' => $categories->random()->id,
                    'title' => 'Task ' . ($i + 1) . ' for ' . $user->name,
                    'description' => 'Sample description for task ' . ($i + 1),
                    'completed' => (bool)random_int(0, 1),
                ]);
            }
        }
    }
}
