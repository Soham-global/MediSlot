import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();
  const loginPath =
    role === 'HOSPITAL_ADMIN' ? '/admin/login' : '/login';

  if (!isAuthenticated || currentRole !== role) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
