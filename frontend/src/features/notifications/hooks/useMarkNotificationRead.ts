import { useMutation } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { notificationKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
