import { useQuery } from "@tanstack/react-query";
import { friendsApi } from "../api/friends.api";
import { friendKeys } from "../api/queryKeys";

const STALE_TIME_MS = 5 * 60_000;

export function useFriendStatus(targetUserId: string) {
  return useQuery({
    queryKey: friendKeys.status(targetUserId),
    queryFn: () => friendsApi.getStatus(targetUserId),
    enabled: !!targetUserId,
    staleTime: STALE_TIME_MS,
  });
}
