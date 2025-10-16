import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import Swal from 'sweetalert2';
import { Clock, AlertCircle, CheckCircle, Save } from 'lucide-react';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // In TakeQuiz.jsx
const [lastSaved, setLastSaved] = useState(null);
const [saving, setSaving] = useState(false);

// Auto-save every 30 seconds
useEffect(() => {
  if (!attemptId || submitting) return;
  
  const saveInterval = setInterval(async () => {
    if (Object.keys(answers).length > 0) {
      try {
        setSaving(true);
        const formattedAnswers = Object.values(answers);
        await quizService.saveProgress(attemptId, formattedAnswers);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }
  }, 30000); // 30 seconds
  
  return () => clearInterval(saveInterval);
}, [answers, attemptId, submitting]);

// Add to quizService.js
saveProgress: (attemptId, answers) => 
  api.post(`/attempts/${attemptId}/save-progress`, { answers }),

  useEffect(() => {
    startQuizAttempt();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quiz?.time_limit || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const startQuizAttempt = async () => {
    try {
      setLoading(true);
      const response = await quizService.startQuiz(quizId);
      const data = response.data.data;
      
      setQuiz(data.quiz);
      setAttemptId(data.attempt_id);
      setQuestions(data.questions);
      setStartTime(data.started_at);
      
      if (data.quiz.time_limit) {
        setTimeLeft(data.quiz.time_limit * 60);
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to start quiz',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/dashboard');
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer, choiceId = null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { answer, choice_id: choiceId, question_id: questionId }
    }));
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      const result = await Swal.fire({
        title: 'Submit Quiz?',
        text: `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#E46036',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'Go back'
      });

      if (!result.isConfirmed) return;
    } else {
      const result = await Swal.fire({
        title: 'Submit Quiz?',
        text: 'Are you sure you want to submit your answers?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#E46036',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = Object.values(answers);
      const response = await quizService.submitQuiz(attemptId, formattedAnswers);
      
      Swal.fire({
        title: 'Success!',
        text: 'Quiz submitted successfully',
        icon: 'success',
        confirmButtonText: 'View Results'
      }).then(() => {
        navigate(`/quiz-results/${attemptId}`);
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to submit quiz',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E46036] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Add to TakeQuiz.jsx header */}
        <div className="text-xs text-gray-500">
        {saving ? (
            <span className="flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-1"></div>
            Saving...
            </span>
        ) : lastSaved ? (
            `Last saved: ${lastSaved.toLocaleTimeString()}`
        ) : (
            'Not saved yet'
        )}
        </div>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            
            {timeLeft !== null && (
              <div className={`flex items-center px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#E46036] h-2 rounded-full transition-all"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-[#E46036] text-white rounded-full flex items-center justify-center font-bold mr-3">
              {currentQuestion + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                  {currentQ.type === 'multiple_choice' ? 'Multiple Choice' : 
                   currentQ.type === 'identification' ? 'Identification' : 'Essay'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
                </span>
              </div>
              <p className="text-lg text-gray-900">{currentQ.question_text}</p>
            </div>
          </div>

          {/* Answer Input based on question type */}
          <div className="mt-6">
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQ.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[currentQ.id]?.choice_id === choice.id
                        ? 'border-[#E46036] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      checked={answers[currentQ.id]?.choice_id === choice.id}
                      onChange={() => handleAnswerChange(currentQ.id, choice.choice_text, choice.id)}
                      className="w-4 h-4 text-[#E46036] focus:ring-[#E46036]"
                    />
                    <span className="ml-3 text-gray-900">{choice.choice_text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQ.type === 'identification' && (
              <input
                type="text"
                value={answers[currentQ.id]?.answer || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E46036] focus:border-transparent"
              />
            )}

            {currentQ.type === 'essay' && (
              <textarea
                value={answers[currentQ.id]?.answer || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your essay answer here..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E46036] focus:border-transparent resize-none"
              />
            )}
          </div>

          {answers[currentQ.id] && (
            <div className="mt-4 flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Answer saved</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded-full font-medium text-sm transition-colors ${
                  idx === currentQuestion
                    ? 'bg-[#E46036] text-white'
                    : answers[questions[idx].id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-[#E46036] text-white rounded-lg font-medium hover:bg-[#cc4f2d] disabled:opacity-50 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2 bg-[#E46036] text-white rounded-lg font-medium hover:bg-[#cc4f2d] transition-colors"
            >
              Next
            </button>
          )}
        </div>

        {/* Warning for unanswered */}
        {Object.keys(answers).length < questions.length && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  You have {questions.length - Object.keys(answers).length} unanswered question(s).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;