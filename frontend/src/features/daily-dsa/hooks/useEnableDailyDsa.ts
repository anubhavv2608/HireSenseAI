import { useMutation } from "@tanstack/react-query";
import { dailyDsaApi } from "../api/dailyDsa.api";
import { dailyDsaKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export function useEnableDailyDsa() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: dailyDsaApi.enable,
    onSuccess: (user) => {
      updateUser(user);
      queryClient.invalidateQueries({ queryKey: dailyDsaKeys.all });
    },
  });
}
