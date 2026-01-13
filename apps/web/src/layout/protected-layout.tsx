import { useAuth } from '@/context/auth-context';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
