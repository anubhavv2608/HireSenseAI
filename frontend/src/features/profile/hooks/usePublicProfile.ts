import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.public(userId),
    queryFn: () => profileApi.getPublicProfile(userId),
    enabled: !!userId,
  });
}

export function usePublicProfileByUsername(username: string) {
  return useQuery({
    queryKey: profileKeys.publicByUsername(username),
    queryFn: () => profileApi.getPublicProfileByUsername(username),
    enabled: !!username,
  });
}
