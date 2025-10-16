<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\DashboardController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/landingpage', [AuthController::class, 'landingPage']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Get all attempts of the authenticated user
    Route::get('/my-attempts', [QuizController::class, 'myAttempts']);

    // User routes
    Route::prefix('users/{id}')->group(function () {
        Route::get('dashboard-stats', [DashboardController::class, 'getStats']);
        Route::get('monthly-stats', [DashboardController::class, 'getMonthlyStats']);
        Route::get('quizzes/{quizId}/stats', [DashboardController::class, 'getQuizStats']);
    });

    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', [AuthController::class, 'dashboard']);

    // QUIZ SAVE PROGRESS
    Route::post('/attempts/{attemptId}/save-progress', [QuizController::class, 'saveProgress']);

    // Quiz Management
    Route::get('/my-quizzes', [QuizController::class, 'myQuizzes']);
    Route::apiResource('quizzes', QuizController::class);
    Route::post('/quizzes/{id}/publish', [QuizController::class, 'publish']);
    Route::post('/quizzes/{id}/unpublish', [QuizController::class, 'unpublish']);

    // Join quiz by code
    Route::post('/quizzes/join', [QuizController::class, 'joinByCode']);

    // Quiz taking
    Route::post('/quizzes/{id}/start', [QuizController::class, 'startQuiz']);
    Route::post('/attempts/{attemptId}/submit', [QuizController::class, 'submitQuiz']);
    Route::get('/attempts/{attemptId}/results', [QuizController::class, 'getResults']);
    Route::get('/my-attempts', [QuizController::class, 'getMyAttempts']);
});

// Fallback route
Route::fallback(function () {
    return response()->json([
        'message' => 'Route not found or unauthorized'
    ], 404);
});
