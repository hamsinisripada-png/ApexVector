import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TelemetryProvider } from './contexts/TelemetryContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import StrategyPage from './pages/StrategyPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PredictivePage from './pages/PredictivePage';
import CommandCenterPage from './pages/CommandCenterPage';
import SettingsPage from './pages/SettingsPage';
import SessionsPage from './pages/SessionsPage';

function AnimatedRoutes() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading ApexVector...</p>
        </div>
      </div>
    );
  }

  const needsOnboarding = user && profile && !profile.onboarding_complete;
  const isAuth = !!user;

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={!isAuth ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!isAuth ? <SignupPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/onboarding"
          element={isAuth ? (needsOnboarding ? <OnboardingPage /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />}
        />
        <Route path="/dashboard" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <DashboardPage />) : <Navigate to="/login" replace />} />
        <Route path="/strategy" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <StrategyPage />) : <Navigate to="/login" replace />} />
        <Route path="/analytics" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <AnalyticsPage />) : <Navigate to="/login" replace />} />
        <Route path="/predictive" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <PredictivePage />) : <Navigate to="/login" replace />} />
        <Route path="/command-center" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <CommandCenterPage />) : <Navigate to="/login" replace />} />
        <Route path="/sessions" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <SessionsPage />) : <Navigate to="/login" replace />} />
        <Route path="/settings" element={isAuth ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <SettingsPage />) : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TelemetryProvider>
          <AnimatedRoutes />
        </TelemetryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
console.log(import.meta.env.VITE_SUPABASE_URL)