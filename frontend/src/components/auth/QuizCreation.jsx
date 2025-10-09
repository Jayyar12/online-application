import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { 
  Clock, 
  Shuffle, 
  Target, 
  Shield, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Info,
  AlertCircle
} from 'lucide-react';

const QuizCreationPage = () => {
  const navigate = useNavigate();

  const [quizConfig, setQuizConfig] = useState({
    title: '',
    description: '',
    timeLimit: { enabled: false, minutes: 30, seconds: 0 },
    questionRandomization: false,
    preventMultipleSubmissions: true,
    questions: [
      { id: 1, text: '', type: 'multiple-choice', points: 1, scoringRule: 'standard' }
    ]
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [errors, setErrors] = useState({});

  const updateQuizConfig = (path, value) => {
    setQuizConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleTimeLimitToggle = () => {
    updateQuizConfig('timeLimit.enabled', !quizConfig.timeLimit.enabled);
  };

  const handleTimeChange = (type, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    if (type === 'minutes') updateQuizConfig('timeLimit.minutes', Math.min(numValue, 999));
    else updateQuizConfig('timeLimit.seconds', Math.min(numValue, 59));
  };

  const addQuestion = () => {
    const newQuestion = { id: Date.now(), text: '', type: 'multiple-choice', points: 1, scoringRule: 'standard' };
    setQuizConfig(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const removeQuestion = (questionId) => {
    if (quizConfig.questions.length > 1) {
      setQuizConfig(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== questionId) }));
    }
  };

  const updateQuestion = (questionId, field, value) => {
    setQuizConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!quizConfig.title.trim()) newErrors.title = 'Quiz title is required';
    if (quizConfig.timeLimit.enabled && quizConfig.timeLimit.minutes === 0 && quizConfig.timeLimit.seconds === 0) {
      newErrors.timeLimit = 'Please set a valid time limit';
    }
    quizConfig.questions.forEach((question, index) => {
      if (!question.text.trim()) newErrors[`question_${question.id}`] = `Question ${index + 1} text is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveQuiz = () => {
    if (validateForm()) {
      console.log('Saving quiz configuration:', quizConfig);
      alert('Quiz saved successfully! (This is a placeholder action)');
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'All changes will be lost',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Quiz creation cancelled");
        navigate("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black">Create New Quiz</h1>
            <p className="text-base text-gray-600">Configure your quiz settings and questions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-600">
              {quizConfig.questions.length} Questions | {quizConfig.questions.reduce((sum, q) => sum + q.points, 0)} Points
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 border border-black text-black bg-white hover:bg-stone-100 rounded text-base font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuiz}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-base font-medium transition-colors"
            >
              Save Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        <div className="w-80 bg-stone-100 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Basic Info
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Title *</label>
                  <input
                    type="text"
                    value={quizConfig.title}
                    onChange={(e) => updateQuizConfig('title', e.target.value)}
                    className={`w-full px-2 py-2 text-base border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Quiz title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={quizConfig.description}
                    onChange={(e) => updateQuizConfig('description', e.target.value)}
                    className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Brief description"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Time Limit
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base text-black">Enable</span>
                  <button
                    type="button"
                    onClick={handleTimeLimitToggle}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${quizConfig.timeLimit.enabled ? 'bg-orange-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizConfig.timeLimit.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                {quizConfig.timeLimit.enabled && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-sm text-black mb-1">Min</label>
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={quizConfig.timeLimit.minutes}
                        onChange={(e) => handleTimeChange('minutes', e.target.value)}
                        className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-black mb-1">Sec</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={quizConfig.timeLimit.seconds}
                        onChange={(e) => handleTimeChange('seconds', e.target.value)}
                        className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
                {errors.timeLimit && (
                  <p className="text-sm text-red-600">{errors.timeLimit}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base text-black">Randomize</span>
                  <button
                    type="button"
                    onClick={() => updateQuizConfig('questionRandomization', !quizConfig.questionRandomization)}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${quizConfig.questionRandomization ? 'bg-orange-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizConfig.questionRandomization ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-black">Single Submit</span>
                  <button
                    type="button"
                    onClick={() => updateQuizConfig('preventMultipleSubmissions', !quizConfig.preventMultipleSubmissions)}
                    className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${quizConfig.preventMultipleSubmissions ? 'bg-orange-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quizConfig.preventMultipleSubmissions ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              {quizConfig.preventMultipleSubmissions && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Students can only submit once. System tracks by email address.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-stone-100 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-black">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-base font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {quizConfig.questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-black">Q{index + 1}</h4>
                    {quizConfig.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Question Text *</label>
                      <textarea
                        rows={2}
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        className={`w-full px-2 py-2 text-base border rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${errors[`question_${question.id}`] ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Enter your question"
                      />
                      {errors[`question_${question.id}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                          className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Points</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Scoring</label>
                        <select
                          value={question.scoringRule}
                          onChange={(e) => updateQuestion(question.id, 'scoringRule', e.target.value)}
                          className="w-full px-2 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="partial">Partial</option>
                          <option value="bonus">Bonus</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationPage;
