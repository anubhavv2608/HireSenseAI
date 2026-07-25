export type FriendStatus = "self" | "friends" | "pending_outgoing" | "pending_incoming" | "none";
export type FriendRequestListType = "incoming" | "outgoing";

export interface FriendStatusResult {
  status: FriendStatus;
  requestId: string | null;
}

export interface FriendCard {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: { publicId: string; url: string };
  college?: string;
  branch?: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: { publicId: string; url: string };
  createdAt: string;
}

export interface FriendsListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
