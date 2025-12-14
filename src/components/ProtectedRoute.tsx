import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import type { UserRole } from '../stores/userStore';
import ErrorFallback from './ErrorFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission 
}) => {
  const { isAuthenticated, token, hasRole, hasPermission } = useUserStore();
  const location = useLocation();

  console.log('ProtectedRoute 检查:', { 
    isAuthenticated, 
    hasToken: !!token, 
    path: location.pathname,
    requiredRole,
    requiredPermission
  });

  // Token验证
  if (!isAuthenticated || !token) {
    console.log('未认证，重定向到登录页');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 角色验证
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('角色权限不足');
    return <ErrorFallback type="permission" message="您的角色权限不足，无法访问此页面" />;
  }

  // 权限验证
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('功能权限不足');
    return <ErrorFallback type="permission" message="您没有访问此功能的权限" />;
  }

  console.log('认证通过，渲染子组件');
  return <>{children}</>;
};

export default ProtectedRoute;
