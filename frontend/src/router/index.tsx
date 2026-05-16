import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/authStore';

import { DashboardPage } from '../features/leads/pages/DashboardPage';

// Helper component to redirect authenticated users away from public routes
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <div className="p-8 text-center text-red-600 font-bold text-2xl">403 - Unauthorized Access</div>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
