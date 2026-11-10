import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import type { UserRole } from '../stores/userStore';
import ErrorFallback from './ErrorFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, token, hasRole } = useUserStore();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <ErrorFallback type="permission" message="你的角色不能访问这个页面" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
