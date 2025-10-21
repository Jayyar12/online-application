<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\EssayGradingController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/landingpage', [AuthController::class, 'landingPage']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {


    // Get all ungraded essays for a quiz
    Route::get('/quizzes/{quizId}/ungraded-essays', [EssayGradingController::class, 'getUngradedEssays']);
    
    // Get essay answers for a specific attempt
    Route::get('/attempts/{attemptId}/essays', [EssayGradingController::class, 'getEssaysForAttempt']);
    
    // Grade a single essay answer
    Route::post('/answers/{answerId}/grade', [EssayGradingController::class, 'gradeAnswer']);
    
    // Grade multiple essay answers at once
    Route::post('/answers/grade-multiple', [EssayGradingController::class, 'gradeMultipleAnswers']);

    /*
    |------------------------------
    | Authenticated User
    |------------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', [AuthController::class, 'dashboard']);

    /*
    |------------------------------
    | Dashboard Statistics
    |------------------------------
    */
    Route::prefix('users/{id}')->group(function () {
        Route::get('dashboard-stats', [DashboardController::class, 'getStats']);
        Route::get('monthly-stats', [DashboardController::class, 'getMonthlyStats']);
        Route::get('quizzes/{quizId}/stats', [DashboardController::class, 'getQuizStats']);
    });

    /*
    |------------------------------
    | Quizzes Management
    |------------------------------
    */
    Route::get('/my-quizzes', [QuizController::class, 'myQuizzes']);
    Route::apiResource('quizzes', QuizController::class);

    Route::post('/quizzes/{id}/publish', [QuizController::class, 'publish']);
    Route::post('/quizzes/{id}/unpublish', [QuizController::class, 'unpublish']);

    Route::get('/quizzes/{id}/participants', [QuizController::class, 'getQuizParticipants']);
    Route::get('/quizzes/{id}/statistics', [QuizController::class, 'getQuizStatistics']);

    /*
    |------------------------------
    | Quiz Participation
    |------------------------------
    */
    Route::post('/quizzes/join', [QuizController::class, 'joinByCode']);
    Route::post('/quizzes/{id}/start', [QuizController::class, 'startQuiz']);

    Route::get('/attempts/{attemptId}/progress', [QuizController::class, 'getAttemptProgress']);

    Route::post('/attempts/{attemptId}/save-progress', [QuizController::class, 'saveProgress']);
    Route::post('/attempts/{attemptId}/submit', [QuizController::class, 'submitQuiz']);
    Route::get('/attempts/{attemptId}/results', [QuizController::class, 'getResults']);

    /*
    |------------------------------
    | User Attempts
    |------------------------------
    */
    Route::get('/my-attempts', [QuizController::class, 'getMyAttempts']);
});

/*
|--------------------------------------------------------------------------
| Fallback Route
|--------------------------------------------------------------------------
*/
Route::fallback(function () {
    return response()->json([
        'message' => 'Route not found or unauthorized'
    ], 404);
});

/*
|--------------------------------------------------------------------------
| Forgot Password Route
|--------------------------------------------------------------------------
*/
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);
Route::post('/password/validate-token', [PasswordResetController::class, 'validateToken']);
