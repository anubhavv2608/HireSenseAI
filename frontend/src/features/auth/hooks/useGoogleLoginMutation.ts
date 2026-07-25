import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { authKeys } from "../api/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { ROUTES } from "@/routes/routePaths";
import type { GoogleLoginPayload } from "../types/auth.types";

export function useGoogleLoginMutation() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: GoogleLoginPayload) => authApi.google(payload),
    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
      queryClient.setQueryData(authKeys.me(), user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    },
  });
}
