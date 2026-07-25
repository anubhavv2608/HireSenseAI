import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authKeys } from "../api/queryKeys";
import { useAuth } from "@/hooks/useAuth";

export function useCurrentUserQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
  });
}
