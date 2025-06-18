<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    // GET /api/categories - List all categories
    public function index()
    {
        $categories = Category::all();
        return response()->json(['data' => $categories]);
    }

    // POST /api/categories - Create a new category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create($validated);
        return response()->json(['data' => $category], 201);
    }

    // GET /api/categories/{id} - Show a single category
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return response()->json(['data' => $category]);
    }

    // PUT /api/categories/{id} - Update a category
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);
        return response()->json(['data' => $category]);
    }

    // DELETE /api/categories/{id} - Delete a category
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
