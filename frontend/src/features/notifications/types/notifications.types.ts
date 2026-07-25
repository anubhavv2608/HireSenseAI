export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "challenge_received"
  | "challenge_accepted"
  | "challenge_declined"
  | "challenge_completed"
  | "system";

export interface Notification {
  _id: string;
  type: NotificationType;
  actorId: string | null;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsQuery {
  unreadOnly?: boolean;
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
