import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";
import { ROUTES } from "./routePaths";

export function RootRedirect() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <LandingPage />;
}
