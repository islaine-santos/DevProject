import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import type { UserType } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedType: UserType;
}

const DASHBOARD_MAP: Record<UserType, string> = {
  cliente: '/cliente',
  profissional: '/profissional',
  admin: '/admin',
};

export function RoleGuard({ children, allowedType }: RoleGuardProps) {
  const { user, loading } = useAuthContext();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.tipo !== allowedType) {
    return <Navigate to={DASHBOARD_MAP[user.tipo] ?? '/'} replace />;
  }

  return <>{children}</>;
}
