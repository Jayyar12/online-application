import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import Dashboard from "./components/auth/Dashboard";
import LandingPage from "./components/auth/LandingPage";
import QuizCreationPage from "./components/auth/CreateQuiz";
import JoinQuiz from "./components/auth/JoinQuiz";
import TakeQuiz from "./components/auth/TakeQuiz";
import QuizResults from "./components/auth/QuizResults";
import QuizParticipants from "./components/auth/QuizParticipants";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          <Route
            path="/landing"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected (auth-only) routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz-creation"
            element={
              <ProtectedRoute>
                <QuizCreationPage />
              </ProtectedRoute>
            }
          />

          {/* Join Quiz - Protected */}
          <Route
            path="/join-quiz"
            element={
              <ProtectedRoute>
                <JoinQuiz />
              </ProtectedRoute>
            }
          />

          {/* Take Quiz - Protected */}
          <Route
            path="/take-quiz/:quizId"
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            }
          />

          {/* Quiz Results - Protected */}
          <Route
            path="/quiz-results/:attemptId"
            element={
              <ProtectedRoute>
                <QuizResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz-participants/:quizId"
            element={
              <ProtectedRoute>
                <QuizParticipants />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;