<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'time_limit' => 'integer',
        'randomize_questions' => 'boolean',
        'randomize_choices' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('M j, Y');
    }

    /**
     * Get the formatted published at attribute
     */
    public function getFormattedPublishedAtAttribute()
    {
        return $this->published_at?->format('M j, Y');
    }

    /**
     * Get the user that owns the quiz.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the questions for the quiz.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    /**
     * Get the quiz attempts.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Scope a query to only include published quizzes.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to only include unpublished quizzes.
     */
    public function scopeUnpublished($query)
    {
        return $query->where('is_published', false);
    }

    /**
     * Scope a query to only include quizzes by a specific user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the total points for the quiz.
     */
    public function getTotalPointsAttribute()
    {
        return $this->questions->sum('points');
    }

    /**
     * Get the total number of questions.
     */
    public function getQuestionCountAttribute()
    {
        return $this->questions->count();
    }

    /**
     * Publish the quiz.
     */
    public function publish()
    {
        $this->update([
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    /**
     * Unpublish the quiz.
     */
    public function unpublish()
    {
        $this->update([
            'is_published' => false,
            'published_at' => null,
        ]);
    }
        /**
     * Generate a unique quiz code.
     */
    public static function generateUniqueCode()
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6));
        } while (self::where('code', $code)->exists());
        
        return $code;
    }
}