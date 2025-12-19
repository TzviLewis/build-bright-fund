import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TeamProtectedRouteProps {
  children: React.ReactNode;
}

export function TeamProtectedRoute({ children }: TeamProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const teamAuth = sessionStorage.getItem('teamAuth');
    
    if (teamAuth === 'true') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      navigate('/team-login', { replace: true });
    }
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
