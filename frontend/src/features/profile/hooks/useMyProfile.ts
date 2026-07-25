import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getMyProfile,
  });
}
