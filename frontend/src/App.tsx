import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { useAuth } from './context/useContexts';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/common/Preloader';

// Code-split pages for fast initial load and smaller chunks
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const GeneratorPage = lazy(() => import('./pages/GeneratorPage').then((m) => ({ default: m.GeneratorPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const AssessmentsPage = lazy(() => import('./pages/AssessmentsPage').then((m) => ({ default: m.AssessmentsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage').then((m) => ({ default: m.CertificatesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const VideosPage = lazy(() => import('./pages/VideosPage').then((m) => ({ default: m.VideosPage })));
const WatchVideoPage = lazy(() =>
  import('./pages/WatchVideoPage').then((m) => ({ default: m.WatchVideoPage }))
);
const MLCoursePage = lazy(() =>
  import('./pages/MLCoursePage').then((m) => ({ default: m.MLCoursePage }))
);
const DLCoursePage = lazy(() =>
  import('./pages/MLCoursePage').then((m) => ({ default: m.DLCoursePage }))
);
const LMSHubPage = lazy(() =>
  import('./pages/LMSHubPage').then((m) => ({ default: m.LMSHubPage }))
);
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage }))
);
const VerifyCertificatePage = lazy(() =>
  import('./pages/VerifyCertificatePage').then((m) => ({ default: m.VerifyCertificatePage }))
);
const WikiPage = lazy(() => import('./pages/WikiPage').then((m) => ({ default: m.WikiPage })));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.has_completed_onboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <PreferencesProvider>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify/:credentialId" element={<VerifyCertificatePage />} />
                <Route path="/wiki" element={<WikiPage />} />
                <Route path="/wiki/:section" element={<WikiPage />} />
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
                  <Route path="lms" element={<LMSHubPage />} />
                  <Route path="lms/:track" element={<CourseDetailPage />} />
                  <Route path="ml-course" element={<MLCoursePage />} />
                  <Route path="ml-course/:lessonId" element={<MLCoursePage />} />
                  <Route path="dl-course" element={<DLCoursePage />} />
                  <Route path="dl-course/:lessonId" element={<DLCoursePage />} />
                  <Route path="videos" element={<VideosPage />} />
                  <Route path="videos/:videoId" element={<WatchVideoPage />} />
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
        </PreferencesProvider>
      </ToastProvider>
    </BrowserRouter>
    </MotionConfig>
  );
};

export default App;
