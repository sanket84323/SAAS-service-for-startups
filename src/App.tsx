import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardHome } from './pages/DashboardHome';
import { IdeaValidator } from './pages/IdeaValidator';
import BusinessPlan from './pages/BusinessPlan';
import { BrandingKit } from './pages/BrandingKit';
import WebsiteContent from './pages/WebsiteContent';
import { MarketingHub } from './pages/MarketingHub';
import { PitchDeckBuilder } from './pages/PitchDeck';
import { MentorChat } from './pages/MentorChat';
import { PlatformAdmin } from './pages/PlatformAdmin';
import { UserProfile } from './pages/UserProfile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useApp();
  
  if (isLoading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading session...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useApp();
  
  if (isLoading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-white">Loading session...</div>;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

      {/* Protected Dashboard Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
      <Route path="/validator" element={<ProtectedRoute><IdeaValidator /></ProtectedRoute>} />
      <Route path="/business-plan" element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
      <Route path="/branding" element={<ProtectedRoute><BrandingKit /></ProtectedRoute>} />
      <Route path="/website" element={<ProtectedRoute><WebsiteContent /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
      <Route path="/pitch-deck" element={<ProtectedRoute><PitchDeckBuilder /></ProtectedRoute>} />
      <Route path="/mentor" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><PlatformAdmin /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
