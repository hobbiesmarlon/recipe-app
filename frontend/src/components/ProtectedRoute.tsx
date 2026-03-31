import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute: React.FC = () => {
  const { user, pendingUser, isLoading, fetchUser } = useAuthStore();
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If there's a token but no user and not loading, try to fetch once
  useEffect(() => {
    if (token && !user && !pendingUser && !isLoading) {
      fetchUser();
    }
  }, [token, user, pendingUser, isLoading, fetchUser]);

  if (!token) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we have a token but fetchUser failed (user and pendingUser are null)
  if (!user && !pendingUser) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // 🛡️ Force registration for new Cognito users
  if (pendingUser && location.pathname !== '/edit-profile') {
    return <Navigate to="/edit-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
