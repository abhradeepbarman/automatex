import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  if (loading) {
    return null;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
