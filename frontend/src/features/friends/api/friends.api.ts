import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  FriendCard,
  FriendRequest,
  FriendRequestListType,
  FriendStatusResult,
  FriendsListQuery,
  PaginatedResult,
} from "../types/friends.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const friendsApi = {
  sendRequest: (targetUserId: string): Promise<{ request: unknown }> =>
    unwrap(apiClient.post("/friends/requests", { targetUserId })),

  acceptRequest: (requestId: string): Promise<{ request: unknown }> =>
    unwrap(apiClient.post(`/friends/requests/${requestId}/accept`)),

  rejectRequest: (requestId: string): Promise<{ request: unknown }> =>
    unwrap(apiClient.post(`/friends/requests/${requestId}/reject`)),

  cancelRequest: (requestId: string): Promise<{ request: unknown }> =>
    unwrap(apiClient.post(`/friends/requests/${requestId}/cancel`)),

  removeFriend: async (userId: string): Promise<void> => {
    await apiClient.delete(`/friends/${userId}`);
  },

  listFriends: (query: FriendsListQuery): Promise<PaginatedResult<FriendCard>> =>
    unwrap(apiClient.get("/friends", { params: query })),

  listRequests: (type: FriendRequestListType, page?: number): Promise<PaginatedResult<FriendRequest>> =>
    unwrap(apiClient.get("/friends/requests", { params: { type, page } })),

  getStatus: (userId: string): Promise<FriendStatusResult> => unwrap(apiClient.get(`/friends/status/${userId}`)),

  getMutualCount: async (userId: string): Promise<number> => {
    const { count } = await unwrap<{ count: number }>(apiClient.get(`/friends/mutual/${userId}`));
    return count;
  },
};
