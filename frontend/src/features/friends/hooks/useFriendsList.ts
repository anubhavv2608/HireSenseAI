import { useQuery } from "@tanstack/react-query";
import { friendsApi } from "../api/friends.api";
import { friendKeys } from "../api/queryKeys";
import type { FriendRequestListType, FriendsListQuery } from "../types/friends.types";

const STALE_TIME_MS = 5 * 60_000;

export function useFriends(query: FriendsListQuery) {
  return useQuery({
    queryKey: friendKeys.list(query),
    queryFn: () => friendsApi.listFriends(query),
    staleTime: STALE_TIME_MS,
  });
}

export function useFriendRequests(type: FriendRequestListType, page?: number) {
  return useQuery({
    queryKey: friendKeys.requests(type, page),
    queryFn: () => friendsApi.listRequests(type, page),
    staleTime: STALE_TIME_MS,
  });
}

export function useMutualFriendsCount(userId: string) {
  return useQuery({
    queryKey: friendKeys.mutual(userId),
    queryFn: () => friendsApi.getMutualCount(userId),
    enabled: !!userId,
  });
}
