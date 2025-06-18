<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TasksTableSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        
        foreach ($users as $user) {
            $categories = $user->categories;
            
            foreach ($categories as $category) {
                // Create 3 tasks per category for each user
                for ($i = 1; $i <= 3; $i++) {
                    $status = ['pending', 'in_progress', 'completed'][rand(0, 2)];
                    
                    Task::create([
                        'title' => "Task {$i} for {$category->name}",
                        'description' => "This is description for task {$i} in category {$category->name}",
                        'status' => $status,
                        'due_date' => Carbon::now()->addDays(rand(1, 30)),
                        'category_id' => $category->id,
                        'user_id' => $user->id
                    ]);
                }
            }
        }
    }
}
