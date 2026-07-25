import type { FriendRequestListType, FriendsListQuery } from "../types/friends.types";

export const friendKeys = {
  all: ["friends"] as const,
  list: (query?: FriendsListQuery) => [...friendKeys.all, "list", query ?? {}] as const,
  requests: (type: FriendRequestListType, page?: number) => [...friendKeys.all, "requests", type, page ?? 1] as const,
  status: (userId: string) => [...friendKeys.all, "status", userId] as const,
  mutual: (userId: string) => [...friendKeys.all, "mutual", userId] as const,
};
