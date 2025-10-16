<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->enum('type', ['identification', 'multiple_choice', 'essay']);
            $table->text('question_text');
            $table->text('correct_answer')->nullable()->comment('For identification type questions');
            $table->integer('points')->default(1);
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index('quiz_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};