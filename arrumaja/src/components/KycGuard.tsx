import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/AuthContext';
import { useProfessional } from '../hooks/useProfessional';
import { LoadingSpinner } from './LoadingSpinner';

interface KycGuardProps {
  children: React.ReactNode;
}

export function KycGuard({ children }: KycGuardProps) {
  const { user, loading: authLoading } = useAuthContext();
  const { professional, loading: proLoading } = useProfessional(user?.id);

  if (authLoading || proLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.tipo !== 'profissional') return <Navigate to="/" replace />;
  if (!professional || professional.kyc_status !== 'aprovado') {
    return <Navigate to="/profissional/verificacao" replace />;
  }

  return <>{children}</>;
}
