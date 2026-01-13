import { useAuth } from '@/context/auth-context';
import { Navigate, Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
