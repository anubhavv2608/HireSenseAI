import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { ROUTES } from "@/routes/routePaths";

export function useLogoutMutation() {
  const { clearSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Clear local session even if the network call fails - the user asked to leave.
      clearSession();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}
