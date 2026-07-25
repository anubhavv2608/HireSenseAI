import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "./routePaths";
import type { Role } from "@/features/auth/types/auth.types";

interface RoleProtectedRouteProps {
  allowedRoles: Role[];
}

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
