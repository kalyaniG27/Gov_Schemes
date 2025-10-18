import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAdminStore from '../../store/useAdminStore';
import AdminLogin from './AdminLogin';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAdminAuthenticated, checkAdminAuth } = useAdminStore();

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;