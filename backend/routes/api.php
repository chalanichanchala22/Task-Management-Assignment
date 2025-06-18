<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController; 

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Route to get the authenticated user
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Grouped routes that require authentication
Route::middleware('auth:sanctum')->group(function () {
    // Tasks endpoints (CRUD)
    Route::apiResource('tasks', TaskController::class);

    // Categories endpoints (CRUD)
    Route::apiResource('categories', CategoryController::class);
});
