<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'code',
        'description',
        'time_limit',
        'randomize_questions',
        'randomize_choices',
        'show_results_immediately',
        'allow_review',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'time_limit' => 'integer',
        'randomize_questions' => 'boolean',
        'randomize_choices' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(fn($quiz) => static::clearCache($quiz));
        static::updated(fn($quiz) => static::clearCache($quiz));
        static::deleted(fn($quiz) => static::clearCache($quiz));
    }

    protected static function clearCache($quiz)
    {
        $userId = $quiz->user_id;
        Cache::forget("dashboard_stats_user_{$userId}");
        Cache::forget("user_quizzes_{$userId}");
        Cache::forget("recent_quizzes_{$userId}");
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('M j, Y');
    }

    public function getFormattedPublishedAtAttribute()
    {
        return $this->published_at?->format('M j, Y');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUnpublished($query)
    {
        return $query->where('is_published', false);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getTotalPointsAttribute()
    {
        return $this->questions->sum('points');
    }

    public function getQuestionCountAttribute()
    {
        return $this->questions->count();
    }

    public function publish()
    {
        $this->update([
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    public function unpublish()
    {
        $this->update([
            'is_published' => false,
            'published_at' => null,
        ]);
    }

    public static function generateUniqueCode()
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6));
        } while (self::where('code', $code)->exists());
        
        return $code;
    }
}
