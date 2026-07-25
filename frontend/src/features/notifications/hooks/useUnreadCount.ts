import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { notificationKeys } from "../api/queryKeys";
import { useAuth } from "@/hooks/useAuth";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: POLL_INTERVAL_MS,
  });
}
