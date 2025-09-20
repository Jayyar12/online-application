import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Swal from 'sweetalert2';


import {
  BookOpen, Users, BarChart3, Settings, Plus, Award, TrendingUp,
  User, LogOut, Menu, X, PlayCircle
} from "lucide-react";

export default function Dashboard() {

  const { isAuthenticated, logout, user } = useAuth(); // Added 'user' from context
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    totalUsers: 0,
    activeQuizzes: 0,
    completions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Fetch user-specific dashboard data
  useEffect(() => {
    const fetchUserDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");

        // Fetch user-specific statistics
        const response = await fetch(`/api/users/${user.id}/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setUserStats(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values on error
        setUserStats({
          totalQuizzes: 0,
          totalUsers: 0,
          activeQuizzes: 0,
          completions: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchUserDashboardData();
    }
  }, [isAuthenticated, user]);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    confirmLogout(true);
  };

  const confirmLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'You will be signed out of your account',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/login");
      }
    });
  };

  // StatCard component
  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const NavItem = ({ icon: Icon, label, pageKey, isActive, userInfo = null }) => (
    <button
      onClick={() => handleNavigation(pageKey)}
      className={`flex items-center w-full px-4 py-2 rounded-lg mb-2 transition-colors ${isActive
        ? 'bg-[#E46036]/10 text-[#E46036]'
        : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <div className="flex flex-col items-start min-w-0 flex-1">
        <span className="text-sm font-medium">{label}</span>
        {userInfo && (
          <div className="text-xs text-gray-500 truncate w-full">
            <div className="truncate">{userInfo.username}</div>
            <div className="truncate">{userInfo.email}</div>
          </div>
        )}
      </div>
    </button>
  );

  // Show loading state while user data is being fetched
  if (!user && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E46036] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#E46036]">Dashboard</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-6">
          <div className="px-6 py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Main</p>
            <NavItem icon={BarChart3} label="Dashboard" pageKey="dashboard" isActive={currentPage === 'dashboard'} />
            <NavItem icon={BookOpen} label="Quizzes" pageKey="quizzes" isActive={currentPage === 'quizzes'} />
            <NavItem icon={Users} label="Join" pageKey="join" isActive={currentPage === 'joim'} />
          </div>
          <div className="px-6 py-3 border-t border-gray-200 mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Settings</p>
            <NavItem icon={Settings} label="Settings" pageKey="settings" isActive={currentPage === 'settings'} />
            <NavItem
              icon={User}
              label="Profile"
              pageKey="profile"
              isActive={currentPage === 'profile'}
            />
          </div>
        </nav>
        <div className="absolute bottom-10 left-10 right-10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => navigate("/quiz-creation")}
              className="bg-[#E46036] hover:bg-[#cc4f2d] text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </button>
              <div className="w-8 h-8 bg-[#E46036] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {currentPage === 'dashboard' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
                </h2>
                <p className="text-gray-600">Here's what's happening with your quizzes today.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={BookOpen}
                  title="My Quizzes"
                  value={userStats.totalQuizzes}
                  color="bg-[#E46036]"
                  trend={userStats.totalQuizzes > 0 ? "+12% this month" : null}
                />
                <StatCard
                  icon={Users}
                  title="Quiz Participants"
                  value={userStats.totalUsers?.toLocaleString() || 0}
                  color="bg-[#E46036]"
                  trend={userStats.totalUsers > 0 ? "+5% this week" : null}
                />
                <StatCard
                  icon={PlayCircle}
                  title="Active Quizzes"
                  value={userStats.activeQuizzes}
                  color="bg-[#E46036]"
                />
                <StatCard
                  icon={Award}
                  title="Total Completions"
                  value={userStats.completions?.toLocaleString() || 0}
                  color="bg-[#E46036]"
                  trend={userStats.completions > 0 ? "+23% this month" : null}
                />
              </div>
            </>
          )}

          {currentPage === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-[#E46036] rounded-full flex items-center justify-center mr-6">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-1">User Profile</h2>
                    <p className="text-gray-600">Manage your account information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-350 mb-2">Full Name</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <span className="text-gray-900">{user?.name || user?.full_name || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-350 mb-2">Email Address</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className="text-gray-900">{user?.email || user?.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#E46036] mb-1">{userStats.totalQuizzes}</div>
                        <div className="text-sm text-gray-600">Quizzes Created</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#E46036] mb-1">{userStats.activeQuizzes}</div>
                        <div className="text-sm text-gray-600">Active Quizzes</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#E46036] mb-1">{userStats.totalUsers}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#E46036] mb-1">{userStats.completions}</div>
                        <div className="text-sm text-gray-600">Completions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage !== 'dashboard' && currentPage !== 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} Page
              </h3>
              <p className="text-gray-600 mb-6">
                This is where your {currentPage} content would go.
              </p>
              <button
                onClick={() => handleNavigation('dashboard')}
                className="bg-[#E46036] hover:bg-[#cc4f2d] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}