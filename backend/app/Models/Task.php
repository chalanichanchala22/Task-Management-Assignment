<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'completed',
    ];

    // Relationship: Task belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: Task belongs to a category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
