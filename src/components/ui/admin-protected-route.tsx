import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    
    if (adminAuth === 'true') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      navigate('/admin-login', { replace: true });
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
