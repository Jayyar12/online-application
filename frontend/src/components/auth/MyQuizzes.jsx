import { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../hooks/useAuth';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import EditQuiz from './EditQuiz';
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  PlayCircle,
  Calendar,
  BarChart3,
  Plus,
  Search,
  Share2,
  Copy,
  Check
} from "lucide-react";


export default function MyQuizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();
  

  

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await quizService.getMyQuizzes({
        per_page: 50,
        search: searchTerm || undefined
      });
      setQuizzes(response.data.data || response.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuizzes();
  }, [searchTerm]);

  const handleShareCode = (quiz) => {
    if (!quiz.code) {
      Swal.fire('No Code', 'This quiz needs to be published first to get a code.', 'info');
      return;
    }

    Swal.fire({
      title: 'Quiz Code',
      html: `
        <div class="text-center">
          <p class="text-gray-600 mb-4">Share this code with participants:</p>
          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <p class="text-4xl font-bold tracking-widest text-[#E46036]">${quiz.code}</p>
          </div>
          <p class="text-sm text-gray-500">Participants can join at: <strong>/join-quiz</strong></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Copy Code',
      confirmButtonColor: '#E46036',
      cancelButtonText: 'Close',
      preConfirm: () => {
        return navigator.clipboard.writeText(quiz.code);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Copied!',
          text: 'Quiz code copied to clipboard',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleCopyCode = async (code, quizId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(quizId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePublish = async (quizId) => {
    try {
      setActionLoading(quizId);
      await quizService.publishQuiz(quizId);
      await fetchMyQuizzes();
      Swal.fire('Published!', 'Quiz is now live for participants.', 'success');
    } catch (err) {
      console.error('Error publishing quiz:', err);
      Swal.fire('Error!', err.response?.data?.message || 'Failed to publish quiz.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (quizId) => {
    try {
      setActionLoading(quizId);
      await quizService.unpublishQuiz(quizId);
      await fetchMyQuizzes();
      Swal.fire('Unpublished!', 'Quiz is no longer available.', 'success');
    } catch (err) {
      console.error('Error unpublishing quiz:', err);
      Swal.fire('Error!', 'Failed to unpublish quiz.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (quizId, quizTitle) => {
    const result = await Swal.fire({
      title: 'Delete Quiz?',
      text: `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setActionLoading(quizId);
        await quizService.deleteQuiz(quizId);
        await fetchMyQuizzes();
        Swal.fire('Deleted!', 'Quiz has been deleted.', 'success');
      } catch (err) {
        console.error('Error deleting quiz:', err);
        Swal.fire('Error!', 'Failed to delete quiz.', 'error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQuestionCountText = (questions) => {
    const count = questions?.length || 0;
    return `${count} question${count !== 1 ? 's' : ''}`;
  };

  const getTotalPoints = (questions) => {
    return questions?.reduce((total, question) => total + (question.points || 0), 0) || 0;
  };

  if (editingQuizId) {
    return (
      <EditQuiz
        quizId={editingQuizId}
        onSuccess={() => {
          setEditingQuizId(null);
          fetchMyQuizzes();
        }}
        onCancel={() => setEditingQuizId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E46036] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
          <p className="text-gray-600">Manage and track your created quizzes</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No quizzes match your search.' : "You haven't created any quizzes yet."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => window.location.href = '/dashboard?page=create-quiz'}
              className="bg-[#E46036] hover:bg-[#cc4f2d] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                      {quiz.description || 'No description'}
                    </p>
                  </div>
                  <div className={`ml-2 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.is_published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>

                {/* Quiz Code Display */}
                {quiz.is_published && quiz.code && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Quiz Code</p>
                        <p className="text-xl font-bold tracking-wider text-[#E46036]">
                          {quiz.code}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCode(quiz.code, quiz.id)}
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === quiz.id ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {getQuestionCountText(quiz.questions)}
                    </span>
                    <span className="flex items-center">
                      <PlayCircle className="w-4 h-4 mr-1" />
                      {getTotalPoints(quiz.questions)} pts
                    </span>
                  </div>
                  {quiz.time_limit && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {quiz.time_limit}m
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {quiz.is_published ? (
                    <>
                      <button
                        onClick={() => handleShareCode(quiz)}
                        className="flex-1 bg-[#E46036] hover:bg-[#cc4f2d] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </button>
                      <button
                        onClick={() => handleUnpublish(quiz.id)}
                        disabled={actionLoading === quiz.id}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Unpublish
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handlePublish(quiz.id)}
                      disabled={actionLoading === quiz.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </button>
                  )}
                  
                  {/* NEW: View Participants Button */}
                  <button
                    onClick={() => navigate(`/quiz-participants/${quiz.id}`)}
                    className="px-3 py-2 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center"
                    title="View participants"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Participants
                  </button>
                  
                  <button
                    onClick={() => setEditingQuizId(quiz.id)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    disabled={actionLoading === quiz.id}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {formatDate(quiz.created_at)}
                    {quiz.published_at && ` • Published ${formatDate(quiz.published_at)}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}