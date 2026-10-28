import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthorLayout } from './layouts/AuthorLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { AuthorDashboard } from './pages/author/AuthorDashboard';
import { MyBooksPage } from './pages/author/MyBooksPage';
import { SubmitQueryPage } from './pages/author/SubmitQueryPage';
import { MyTicketsPage } from './pages/author/MyTicketsPage';
import { TicketDetailPage } from './pages/author/TicketDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTicketQueue } from './pages/admin/AdminTicketQueue';
import { AdminTicketDetail } from './pages/admin/AdminTicketDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'admin' | 'author' }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf7]">
        <div className="w-8 h-8 border-3 border-ink-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/author/dashboard'} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf7]">
        <div className="w-8 h-8 border-3 border-ink-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/author/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Author Portal Protected Routes */}
            <Route
              path="/author"
              element={
                <ProtectedRoute allowedRole="author">
                  <AuthorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/author/dashboard" replace />} />
              <Route path="dashboard" element={<AuthorDashboard />} />
              <Route path="books" element={<MyBooksPage />} />
              <Route path="tickets" element={<MyTicketsPage />} />
              <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="submit-query" element={<SubmitQueryPage />} />
            </Route>

            {/* Admin Portal Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tickets" element={<AdminTicketQueue />} />
              <Route path="tickets/:ticketId" element={<AdminTicketDetail />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

