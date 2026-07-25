import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useRemoveProfilePicture() {
  return useMutation({
    mutationFn: profileApi.removeProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
