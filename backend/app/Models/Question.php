<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'question_text',
        'correct_answer',
        'points',
        'order',
    ];

    protected $casts = [
        'points' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the quiz that owns the question
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the choices for the question
     */
    public function choices()
    {
        return $this->hasMany(Choice::class)->orderBy('order');
    }

    /**
     * Get answers for this question
     */
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
}