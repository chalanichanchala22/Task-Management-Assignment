<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // GET /api/tasks - List all tasks for the authenticated user
    public function index(Request $request)
    {
        try {
            // For debugging, confirm we have a user
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'No authenticated user found'], 401);
            }
            
            // Get tasks for current user
            $tasks = Task::where('user_id', $user->id)->get();
            
            return response()->json($tasks);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving tasks',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // POST /api/tasks - Create a new task
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,in_progress,completed',
            'priority' => 'nullable|string|in:low,medium,high'
        ]);

        $task = new Task($validated);
        $task->user_id = $request->user()->id;
        $task->status = $task->status ?? 'pending';
        $task->priority = $task->priority ?? 'medium';
        $task->save();

        return response()->json($task, 201);
    }

    // PUT /api/tasks/{id} - Update an existing task
    public function update(Request $request, $id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        
        // Check if the task belongs to the authenticated user
        if ($request->user()->id !== $task->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|string|in:pending,in_progress,completed',
            'priority' => 'nullable|string|in:low,medium,high'
        ]);

        $task->update($validated);

        return $task;
    }

    // DELETE /api/tasks/{id} - Delete a task
    public function destroy($id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        
        // Check if the task belongs to the authenticated user
        if ($request->user()->id !== $task->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}
