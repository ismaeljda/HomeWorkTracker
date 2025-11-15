import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ('admin' | 'prof' | 'eleve')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect to their appropriate dashboard
    switch (userData.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'prof':
        return <Navigate to="/prof" />;
      case 'eleve':
        return <Navigate to="/eleve" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

export default ProtectedRoute;
