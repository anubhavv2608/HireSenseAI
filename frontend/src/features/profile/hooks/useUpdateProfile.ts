import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
