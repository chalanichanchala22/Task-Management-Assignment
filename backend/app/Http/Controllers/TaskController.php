<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // GET /api/tasks - List all tasks for the authenticated user
    public function index()
    {
        $tasks = Auth::user()->tasks()->with('category')->get();
        return response()->json(['data' => $tasks]);
    }

    // POST /api/tasks - Create a new task
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'completed' => 'boolean',
        ]);

        $task = Auth::user()->tasks()->create($validated);
        return response()->json(['data' => $task], 201);
    }

    // GET /api/tasks/{id} - Show a single task
    public function show($id)
    {
        $task = Auth::user()->tasks()->with('category')->findOrFail($id);
        return response()->json(['data' => $task]);
    }

    // PUT /api/tasks/{id} - Update an existing task
    public function update(Request $request, $id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'completed' => 'boolean',
        ]);

        $task->update($validated);
        return response()->json(['data' => $task]);
    }

    // DELETE /api/tasks/{id} - Delete a task
    public function destroy($id)
    {
        $task = Auth::user()->tasks()->findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully.']);
    }
}
