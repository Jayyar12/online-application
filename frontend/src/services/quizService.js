import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const quizService = {
  // Quiz CRUD
  getAllQuizzes: (params = {}) => api.get('/quizzes', { params }),
  getMyQuizzes: (params = {}) => api.get('/my-quizzes', { params }),
  createQuiz: (data) => api.post('/quizzes', data),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  publishQuiz: (id) => api.post(`/quizzes/${id}/publish`),
  unpublishQuiz: (id) => api.post(`/quizzes/${id}/unpublish`),

  // Question Management
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  reorderQuestions: (quizId, questionIds) => api.post(`/quizzes/${quizId}/questions/reorder`, { question_ids: questionIds }),

  // Quiz Participation
  joinQuizByCode: (code) => api.post('/quizzes/join', { code }),
  startQuiz: (quizId) => api.post(`/quizzes/${quizId}/start`),
  submitQuiz: (attemptId, answers) => api.post(`/attempts/${attemptId}/submit`, { answers }),
  getResults: (attemptId) => api.get(`/attempts/${attemptId}/results`),
  getMyAttempts: (params = {}) => api.get('/my-attempts', { params }),

  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },


  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
    },
  };

export default quizService;