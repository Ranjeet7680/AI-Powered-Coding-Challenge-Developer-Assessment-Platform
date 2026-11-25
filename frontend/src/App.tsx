import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded pages for route-level code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const GeneratorPage = React.lazy(() => import('./pages/GeneratorPage').then((m) => ({ default: m.GeneratorPage })));
const ChallengesPage = React.lazy(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const WorkspacePage = React.lazy(() => import('./pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage })));
const SubmissionsPage = React.lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const AssessmentsPage = React.lazy(() => import('./pages/AssessmentsPage').then((m) => ({ default: m.AssessmentsPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));
const CertificatesPage = React.lazy(() => import('./pages/CertificatesPage').then((m) => ({ default: m.CertificatesPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const VideosPage = React.lazy(() => import('./pages/VideosPage').then((m) => ({ default: m.VideosPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading Coding Task Factory...</span>
    </div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
