import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { notificationKeys } from "../api/queryKeys";
import type { NotificationsQuery } from "../types/notifications.types";

export function useNotifications(query: NotificationsQuery) {
  return useQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => notificationsApi.list(query),
  });
}
