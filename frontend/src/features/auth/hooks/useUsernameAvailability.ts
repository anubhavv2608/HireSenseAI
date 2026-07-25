import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { isValidUsernameFormat } from "../utils/username";

export function useUsernameAvailability(username: string, currentUsername?: string) {
  const trimmed = username.trim().toLowerCase();
  const isUnchanged = !!currentUsername && trimmed === currentUsername.toLowerCase();
  const enabled = isValidUsernameFormat(trimmed) && !isUnchanged;

  return useQuery({
    queryKey: ["auth", "username-availability", trimmed],
    queryFn: () => authApi.checkUsernameAvailability(trimmed),
    enabled,
    staleTime: 0,
  });
}
