import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "../components/Loader";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
