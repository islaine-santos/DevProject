import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import type { UserType } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedType?: UserType;
}

export function ProtectedRoute({ children, allowedType }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedType && user.tipo !== allowedType) return <Navigate to="/" replace />;

  return <>{children}</>;
}
