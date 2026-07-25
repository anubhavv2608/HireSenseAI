import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { Notification, NotificationsQuery, PaginatedResult } from "../types/notifications.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const notificationsApi = {
  list: (query: NotificationsQuery): Promise<PaginatedResult<Notification>> =>
    unwrap(apiClient.get("/notifications", { params: query })),

  getUnreadCount: async (): Promise<number> => {
    const { count } = await unwrap<{ count: number }>(apiClient.get("/notifications/unread-count"));
    return count;
  },

  markRead: async (id: string): Promise<Notification> => {
    const { notification } = await unwrap<{ notification: Notification }>(apiClient.patch(`/notifications/${id}/read`));
    return notification;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },
};
