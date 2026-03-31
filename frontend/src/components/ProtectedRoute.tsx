import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute: React.FC = () => {
  const { user, pendingUser, isLoading, fetchUser } = useAuthStore();
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If there's a token but no user/pending state, and we're NOT currently loading,
  // this is the initial mount after a refresh. Trigger fetch.
  useEffect(() => {
    if (token && !user && !pendingUser && !isLoading) {
      fetchUser();
    }
  }, [token, user, pendingUser, isLoading, fetchUser]);

  // 1. If no token at all, definitely not logged in
  if (!token) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // 2. If we ARE loading (either initial mount or triggered fetch), show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 3. If loading finished and we STILL have no user/pending state, the token was likely invalid
  if (!user && !pendingUser) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // 4. Force registration for new Cognito users
  if (pendingUser && location.pathname !== '/edit-profile') {
    return <Navigate to="/edit-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
