import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { VideosPage } from './pages/VideosPage';

// Layout
import { AppLayout } from './components/layout/AppLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Coding Task Factory...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding and is not already on onboarding, guide them to onboarding
  if (!user?.has_completed_onboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Application Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="videos/:videoId" element={<VideosPage />} />
            <Route path="generator" element={<GeneratorPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="workspace" element={<Navigate to="/app/workspace/c2-lru-cache" replace />} />
            <Route path="workspace/:challengeId" element={<WorkspacePage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
