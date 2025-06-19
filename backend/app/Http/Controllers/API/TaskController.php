<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Get all tasks for the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $query = Task::where('user_id', $user->id);
            
            // Add optional filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }
            
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            
            // Add sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            $tasks = $query->get();
            
            return response()->json([
                'tasks' => $tasks,
                'count' => $tasks->count(),
                'message' => 'Tasks retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving tasks',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get a single task by ID
     * 
     * @param int $id
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id, Request $request)
    {
        try {
            $task = Task::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            return response()->json([
                'task' => $task,
                'message' => 'Task retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Task not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Create a new task
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'status' => 'nullable|string|in:pending,in_progress,completed',
                'priority' => 'nullable|string|in:low,medium,high',
                'category_id' => 'nullable|integer|exists:categories,id'
            ]);

            $task = new Task($validated);
            $task->user_id = $request->user()->id;
            $task->status = $task->status ?? 'pending';
            $task->priority = $task->priority ?? 'medium';
            $task->save();

            return response()->json([
                'task' => $task,
                'message' => 'Task created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing task
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $task = Task::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'status' => 'nullable|string|in:pending,in_progress,completed',
                'priority' => 'nullable|string|in:low,medium,high',
                'category_id' => 'nullable|integer|exists:categories,id'
            ]);

            $task->update($validated);

            return response()->json([
                'task' => $task,
                'message' => 'Task updated successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a task
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, $id)
    {
        try {
            $task = Task::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $task->delete();

            return response()->json([
                'message' => 'Task deleted successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting task',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update task status
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $task = Task::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
                
            $validated = $request->validate([
                'status' => 'required|string|in:pending,in_progress,completed',
            ]);

            $task->status = $validated['status'];
            $task->save();

            return response()->json([
                'task' => $task,
                'message' => 'Task status updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating task status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get task statistics for the authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics(Request $request)
    {
        try {
            $userId = $request->user()->id;
            
            $totalTasks = Task::where('user_id', $userId)->count();
            $completedTasks = Task::where('user_id', $userId)->where('status', 'completed')->count();
            $pendingTasks = Task::where('user_id', $userId)->where('status', 'pending')->count();
            $inProgressTasks = Task::where('user_id', $userId)->where('status', 'in_progress')->count();
            
            $highPriorityTasks = Task::where('user_id', $userId)->where('priority', 'high')->count();
            $dueSoonTasks = Task::where('user_id', $userId)
                ->where('status', '!=', 'completed')
                ->whereDate('due_date', '>=', now())
                ->whereDate('due_date', '<=', now()->addDays(3))
                ->count();
                
            $overdueTasks = Task::where('user_id', $userId)
                ->where('status', '!=', 'completed')
                ->whereDate('due_date', '<', now())
                ->count();
            
            return response()->json([
                'statistics' => [
                    'total_tasks' => $totalTasks,
                    'completed_tasks' => $completedTasks,
                    'pending_tasks' => $pendingTasks,
                    'in_progress_tasks' => $inProgressTasks,
                    'high_priority_tasks' => $highPriorityTasks,
                    'due_soon_tasks' => $dueSoonTasks,
                    'overdue_tasks' => $overdueTasks,
                    'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0
                ],
                'message' => 'Task statistics retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving task statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
