import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function useUpdateUsername() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (username: string) => authApi.updateUsername(username),
    onSuccess: (user) => {
      updateUser({ username: user.username });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
