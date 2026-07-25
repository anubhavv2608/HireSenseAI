import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useUpdateDailyDsaEmailPreference() {
  return useMutation({
    mutationFn: (receiveDailyDSAEmails: boolean) => profileApi.updateDailyDsaEmailPreference(receiveDailyDSAEmails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
