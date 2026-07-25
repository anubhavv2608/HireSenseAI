import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "@/features/notifications/hooks/useMarkNotificationRead";
import { ROUTES } from "@/routes/routePaths";

export function NotificationsWidget() {
  const query = useNotifications({ unreadOnly: true, limit: 5 });
  const markReadMutation = useMarkNotificationRead();
  const notifications = query.data?.data ?? [];

  return (
    <ContentCard
      title="Notifications"
      description={notifications.length > 0 ? `${notifications.length} unread` : undefined}
    >
      {query.isPending ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : notifications.length === 0 ? (
        <EmptyState title="You're all caught up" className="border-none p-0 py-4" />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}
      <Link to={ROUTES.NOTIFICATIONS} className="mt-3 block text-center text-sm text-primary hover:underline">
        View all notifications
      </Link>
    </ContentCard>
  );
}
