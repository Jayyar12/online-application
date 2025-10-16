import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Award, CheckCircle, XCircle, Clock, ArrowLeft, Eye } from 'lucide-react';

const QuizResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await quizService.getResults(attemptId);
      setResults(response.data.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScorePercentage = () => {
    if (!results) return 0;
    return Math.round((results.score / results.total_points) * 100);
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'bg-green-50 border-green-200';
    if (percentage >= 75) return 'bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getGradeText = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 75) return 'Good Job!';
    if (percentage >= 60) return 'Passed';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E46036] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Results not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-[#E46036] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Score Card */}
        <div className={`bg-white rounded-2xl shadow-lg border-2 p-8 mb-6 ${getScoreBackground()}`}>
          <div className="text-center">
            <Award className={`w-16 h-16 mx-auto mb-4 ${getScoreColor()}`} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGradeText()}
            </h1>
            <p className="text-gray-600 mb-6">{results.quiz_title}</p>
            
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className={`text-4xl font-bold ${getScoreColor()}`}>
                  {results.score}/{results.total_points}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className={`text-4xl font-bold ${getScoreColor()}`}>
                  {getScorePercentage()}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all ${
                  getScorePercentage() >= 90 ? 'bg-green-600' :
                  getScorePercentage() >= 75 ? 'bg-blue-600' :
                  getScorePercentage() >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${getScorePercentage()}%` }}
              />
            </div>

            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Completed on {new Date(results.completed_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Review Button */}
        {results.allow_review && results.answers && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-[#E46036] mr-3" />
                <span className="font-semibold text-gray-900">
                  {showReview ? 'Hide' : 'View'} Answer Review
                </span>
              </div>
              <span className="text-gray-600">{showReview ? '▲' : '▼'}</span>
            </button>
          </div>
        )}

        {/* Answer Review */}
        {showReview && results.answers && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h2>
            {results.answers.map((answer, index) => (
              <div key={answer.question_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Question Header */}
                <div className="flex items-start mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        {answer.question_type === 'multiple_choice' ? 'Multiple Choice' : 
                         answer.question_type === 'identification' ? 'Identification' : 'Essay'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        answer.is_correct 
                          ? 'bg-green-100 text-green-700' 
                          : answer.is_correct === false 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {answer.is_correct 
                          ? 'Correct' 
                          : answer.is_correct === false 
                          ? 'Incorrect'
                          : 'Pending Review'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {answer.points_earned}/{answer.points_possible} pts
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{answer.question_text}</p>
                  </div>
                  {answer.is_correct !== null && (
                    answer.is_correct ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )
                  )}
                </div>

                {/* Answer Details */}
                <div className="ml-11 space-y-3">
                  {/* Multiple Choice Options */}
                  {answer.question_type === 'multiple_choice' && answer.choices && (
                    <div className="space-y-2">
                      {answer.choices.map((choice) => {
                        const isUserAnswer = choice.choice_text === answer.user_answer;
                        const isCorrectAnswer = choice.is_correct;
                        
                        return (
                          <div
                            key={choice.id}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectAnswer && isUserAnswer
                                ? 'bg-green-50 border-green-500'
                                : isCorrectAnswer
                                ? 'bg-green-50 border-green-300'
                                : isUserAnswer
                                ? 'bg-red-50 border-red-500'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`${
                                isCorrectAnswer || isUserAnswer ? 'font-medium' : ''
                              }`}>
                                {choice.choice_text}
                              </span>
                              <div className="flex items-center gap-2">
                                {isUserAnswer && (
                                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                    Your answer
                                  </span>
                                )}
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Answers (Identification/Essay) */}
                  {(answer.question_type === 'identification' || answer.question_type === 'essay') && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                        <div className={`p-3 rounded-lg border-2 ${
                          answer.is_correct 
                            ? 'bg-green-50 border-green-300'
                            : answer.is_correct === false
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <p className="text-gray-900">{answer.user_answer || 'No answer provided'}</p>
                        </div>
                      </div>
                      
                      {answer.question_type === 'identification' && answer.correct_answer && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                          <div className="p-3 rounded-lg bg-green-50 border-2 border-green-300">
                            <p className="text-gray-900 font-medium">{answer.correct_answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!results.show_details && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">
              Detailed results and answer review are not available for this quiz. 
              Please contact your instructor for more information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;