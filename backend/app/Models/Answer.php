<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_attempt_id',
        'question_id',
        'choice_id',
        'answer_text',
        'is_correct',
        'points_earned',
        'feedback', // MAKE SURE THIS IS HERE
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'float',
    ];

    /**
     * Get the quiz attempt that owns the answer.
     */
    public function attempt()
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /**
     * Get the question that owns the answer.
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the choice that was selected (for multiple choice).
     */
    public function choice()
    {
        return $this->belongsTo(Choice::class);
    }
}