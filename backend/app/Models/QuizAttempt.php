<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

        /**
     * Get the answers for this attempt
     */
    public function answers()
    {
        return $this->hasMany(Answer::class, 'quiz_attempt_id');
    }

    // Relationships
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}