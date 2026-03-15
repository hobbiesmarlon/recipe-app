import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Save where they were trying to go
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
