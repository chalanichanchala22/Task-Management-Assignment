<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'preferences' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all tasks belonging to the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get all categories belonging to the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Get all completed tasks for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function completedTasks()
    {
        return $this->tasks()->where('status', 'completed');
    }

    /**
     * Get all pending tasks for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pendingTasks()
    {
        return $this->tasks()->where('status', 'pending');
    }

    /**
     * Get all high priority tasks for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function highPriorityTasks()
    {
        return $this->tasks()->where('priority', 'high');
    }

    /**
     * Get all overdue tasks for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function overdueTasks()
    {
        return $this->tasks()
            ->where('due_date', '<', now())
            ->where('status', '!=', 'completed');
    }

    /**
     * Get tasks due today for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tasksDueToday()
    {
        return $this->tasks()->whereDate('due_date', now());
    }

    /**
     * Get a preference value.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getPreference($key, $default = null)
    {
        if (!$this->preferences) {
            return $default;
        }
        
        return $this->preferences[$key] ?? $default;
    }

    /**
     * Set a preference value.
     *
     * @param string $key
     * @param mixed $value
     * @return $this
     */
    public function setPreference($key, $value)
    {
        $preferences = $this->preferences ?? [];
        $preferences[$key] = $value;
        $this->preferences = $preferences;
        return $this;
    }

    /**
     * Get the total number of tasks.
     *
     * @return int
     */
    public function getTaskCountAttribute()
    {
        return $this->tasks()->count();
    }

    /**
     * Get the completion rate of tasks in percentage.
     *
     * @return float
     */
    public function getCompletionRateAttribute()
    {
        $totalTasks = $this->task_count;
        if ($totalTasks === 0) {
            return 0;
        }
        
        $completedTasks = $this->completedTasks()->count();
        return round(($completedTasks / $totalTasks) * 100, 2);
    }
}
