import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, homePathForRole } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

export function ProtectedRoute({ role }) {
  const { isAuthenticated, loading, role: currentRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen label="Preparing your care dashboard…" />;
  }

  if (!isAuthenticated) {
    const loginPath = role === "HOSPITAL_ADMIN" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={homePathForRole(currentRole)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingScreen label="Loading MediSlot…" />;
  }

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(role)} replace />;
  }

  return <Outlet />;
}
