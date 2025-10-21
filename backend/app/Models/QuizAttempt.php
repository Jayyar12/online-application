<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'score',
        'total_questions',
        'completed',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(fn($attempt) => static::clearCache($attempt));
        static::updated(fn($attempt) => static::clearCache($attempt));
        static::deleted(fn($attempt) => static::clearCache($attempt));
    }

    protected static function clearCache($attempt)
    {
        $quizId = $attempt->quiz_id;
        $userId = $attempt->user_id;
        Cache::forget("quiz_stats_{$quizId}_user_{$userId}");
        Cache::forget("dashboard_stats_user_{$userId}");
    }

    public function answers()
    {
        return $this->hasMany(Answer::class, 'quiz_attempt_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
