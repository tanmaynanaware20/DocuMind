import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Layouts
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { SolutionsPage } from './pages/public/SolutionsPage';
import { PricingPage } from './pages/public/PricingPage';
import { SecurityPage } from './pages/public/SecurityPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// App Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { DocumentsPage } from './pages/app/DocumentsPage';
import { CollectionsPage } from './pages/app/CollectionsPage';
import { ChatPage } from './pages/app/ChatPage';
import { ComparePage } from './pages/app/ComparePage';
import { SearchPage } from './pages/app/SearchPage';
import { ReportsPage } from './pages/app/ReportsPage';
import { ActivityPage } from './pages/app/ActivityPage';
import { SettingsPage } from './pages/app/SettingsPage';

// Public wrapper layout with Navbar & Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
            <Route path="/solutions" element={<PublicLayout><SolutionsPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/security" element={<PublicLayout><SecurityPage /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

            {/* Auth Screens */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Application Workspace Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
