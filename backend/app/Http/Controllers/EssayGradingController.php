<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\QuizAttempt;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EssayGradingController extends Controller
{
    /**
     * Get all ungraded essays for a specific quiz
     */
    public function getUngradedEssays(Request $request, $quizId)
    {
        try {
            $quiz = \App\Models\Quiz::with(['questions' => function($query) {
                $query->where('type', 'essay');
            }])->findOrFail($quizId);

            // Check if user owns this quiz
            if ($quiz->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized to grade this quiz'
                ], 403);
            }

            // Get all essay answers that need grading
            $ungradedAnswers = Answer::whereHas('question', function($query) use ($quizId) {
                $query->where('quiz_id', $quizId)
                      ->where('type', 'essay');
            })
            ->whereNull('is_correct') // Not yet graded
            ->with(['attempt.user', 'question'])
            ->get()
            ->groupBy('question_id');

            $formattedData = [];
            foreach ($ungradedAnswers as $questionId => $answers) {
                $question = $answers->first()->question;
                $formattedData[] = [
                    'question_id' => $questionId,
                    'question_text' => $question->question_text,
                    'points' => $question->points,
                    'ungraded_count' => $answers->count(),
                    'submissions' => $answers->map(function($answer) {
                        return [
                            'answer_id' => $answer->id,
                            'attempt_id' => $answer->quiz_attempt_id,
                            'student_name' => $answer->attempt->user->name ?? 'Unknown',
                            'student_email' => $answer->attempt->user->email ?? 'N/A',
                            'answer_text' => $answer->answer_text,
                            'submitted_at' => $answer->created_at,
                        ];
                    })
                ];
            }

            return response()->json([
                'data' => [
                    'quiz' => [
                        'id' => $quiz->id,
                        'title' => $quiz->title,
                    ],
                    'ungraded_essays' => $formattedData,
                    'total_ungraded' => $ungradedAnswers->flatten()->count(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching ungraded essays: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch ungraded essays',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get essay answers for a specific attempt (for grading individual student)
     */
    public function getEssaysForAttempt(Request $request, $attemptId)
    {
        try {
            $attempt = QuizAttempt::with(['quiz', 'user'])->findOrFail($attemptId);

            // Check if user owns the quiz
            if ($attempt->quiz->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized to grade this attempt'
                ], 403);
            }

            // Get essay answers for this attempt
            $essayAnswers = Answer::where('quiz_attempt_id', $attemptId)
                ->whereHas('question', function($query) {
                    $query->where('type', 'essay');
                })
                ->with('question')
                ->get();

            $formattedAnswers = $essayAnswers->map(function($answer) {
                return [
                    'answer_id' => $answer->id,
                    'question_id' => $answer->question_id,
                    'question_text' => $answer->question->question_text,
                    'max_points' => $answer->question->points,
                    'answer_text' => $answer->answer_text,
                    'current_points' => $answer->points_earned,
                    'is_graded' => $answer->is_correct !== null,
                    'feedback' => $answer->feedback,
                ];
            });

            return response()->json([
                'data' => [
                    'attempt' => [
                        'id' => $attempt->id,
                        'student_name' => $attempt->user->name ?? 'Unknown',
                        'student_email' => $attempt->user->email ?? 'N/A',
                        'quiz_title' => $attempt->quiz->title,
                    ],
                    'essay_answers' => $formattedAnswers,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching essay answers: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch essay answers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Grade a single essay answer
     */
    public function gradeAnswer(Request $request, $answerId)
    {
        $validator = Validator::make($request->all(), [
            'points_earned' => 'required|numeric|min:0',
            'feedback' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $answer = Answer::with(['question', 'attempt.quiz'])->findOrFail($answerId);

            // Check authorization
            if ($answer->attempt->quiz->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized to grade this answer'
                ], 403);
            }

            // Validate points don't exceed max points
            if ($request->points_earned > $answer->question->points) {
                return response()->json([
                    'message' => 'Points earned cannot exceed maximum points for this question',
                    'errors' => [
                        'points_earned' => ['Points earned cannot exceed ' . $answer->question->points]
                    ]
                ], 422);
            }

            // Store old points
            $oldPoints = $answer->points_earned ?? 0;
            $newPoints = $request->points_earned;
            $pointsDifference = $newPoints - $oldPoints;

            // Update answer
            $answer->update([
                'points_earned' => $newPoints,
                'is_correct' => $newPoints >= ($answer->question->points * 0.6), // 60% or more is correct
                'feedback' => $request->feedback,
            ]);

            // Update attempt score
            $attempt = $answer->attempt;
            $attempt->score = ($attempt->score ?? 0) + $pointsDifference;
            $attempt->save();

            DB::commit();

            return response()->json([
                'message' => 'Answer graded successfully',
                'data' => [
                    'answer_id' => $answer->id,
                    'points_earned' => $answer->points_earned,
                    'feedback' => $answer->feedback,
                    'new_attempt_score' => $attempt->score,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error grading answer: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to grade answer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Grade multiple essay answers at once
     */
    public function gradeMultipleAnswers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'grades' => 'required|array|min:1',
            'grades.*.answer_id' => 'required|exists:answers,id',
            'grades.*.points_earned' => 'required|numeric|min:0',
            'grades.*.feedback' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $results = [];
            $attemptScoreUpdates = [];

            foreach ($request->grades as $gradeData) {
                $answer = Answer::with(['question', 'attempt.quiz'])->findOrFail($gradeData['answer_id']);

                // Check authorization
                if ($answer->attempt->quiz->user_id !== $request->user()->id) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Unauthorized to grade answer ID: ' . $gradeData['answer_id']
                    ], 403);
                }

                // Validate points
                if ($gradeData['points_earned'] > $answer->question->points) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Points earned cannot exceed maximum points',
                        'errors' => [
                            'grades.' . $gradeData['answer_id'] . '.points_earned' => 
                                ['Points cannot exceed ' . $answer->question->points]
                        ]
                    ], 422);
                }

                // Store old points
                $oldPoints = $answer->points_earned ?? 0;
                $newPoints = $gradeData['points_earned'];
                $pointsDifference = $newPoints - $oldPoints;

                // Update answer
                $answer->update([
                    'points_earned' => $newPoints,
                    'is_correct' => $newPoints >= ($answer->question->points * 0.6),
                    'feedback' => $gradeData['feedback'] ?? null,
                ]);

                // Track score updates per attempt
                $attemptId = $answer->quiz_attempt_id;
                if (!isset($attemptScoreUpdates[$attemptId])) {
                    $attemptScoreUpdates[$attemptId] = 0;
                }
                $attemptScoreUpdates[$attemptId] += $pointsDifference;

                $results[] = [
                    'answer_id' => $answer->id,
                    'graded' => true,
                ];
            }

            // Update all affected attempt scores
            foreach ($attemptScoreUpdates as $attemptId => $scoreDifference) {
                $attempt = QuizAttempt::findOrFail($attemptId);
                $attempt->score = ($attempt->score ?? 0) + $scoreDifference;
                $attempt->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'All answers graded successfully',
                'data' => [
                    'graded_count' => count($results),
                    'results' => $results,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error grading multiple answers: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to grade answers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}