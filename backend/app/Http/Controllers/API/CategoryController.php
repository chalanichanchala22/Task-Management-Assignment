<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Get all categories for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $categories = Auth::user()->categories()->orderBy('name')->get();
            return response()->json([
                'categories' => $categories,
                'message' => 'Categories retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific category
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $category = Auth::user()->categories()->findOrFail($id);
            return response()->json([
                'category' => $category,
                'message' => 'Category retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Category not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new category
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    function ($attribute, $value, $fail) {
                        if (Auth::user()->categories()->where('name', $value)->exists()) {
                            $fail('You already have a category with this name.');
                        }
                    },
                ],
                'description' => 'nullable|string|max:1000',
                'color' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $category = Auth::user()->categories()->create($request->all());
            return response()->json([
                'category' => $category,
                'message' => 'Category created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing category
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $category = Auth::user()->categories()->findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    function ($attribute, $value, $fail) use ($id) {
                        if (Auth::user()->categories()->where('name', $value)->where('id', '!=', $id)->exists()) {
                            $fail('You already have a different category with this name.');
                        }
                    },
                ],
                'description' => 'nullable|string|max:1000',
                'color' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $category->update($request->all());
            
            return response()->json([
                'category' => $category,
                'message' => 'Category updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating category',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Delete a category
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $category = Auth::user()->categories()->findOrFail($id);
            
            // Check if category has tasks/items before deleting
            if ($category->tasks()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete category that contains tasks',
                    'tasks_count' => $category->tasks()->count()
                ], 422);
            }
            
            $category->delete();
            
            return response()->json([
                'message' => 'Category deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting category',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }
}
