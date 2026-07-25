import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useNotificationsInfinite } from "../hooks/useNotificationsInfinite";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { NotificationItem } from "../components/NotificationItem";

export default function NotificationsPage() {
  const query = useNotificationsInfinite();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const sentinelRef = useInfiniteScroll(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, query.hasNextPage ?? false);

  const notifications = query.data?.pages.flatMap((page) => page.data) ?? [];
  const hasUnread = notifications.some((notification) => !notification.isRead);

  return (
    <PageContainer className="max-w-2xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Friend requests, challenges, and updates from the community."
        actions={
          hasUnread && (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
              Mark all read
            </Button>
          )
        }
      />

      {query.isPending ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : query.isError ? (
        <ErrorState description="Couldn't load notifications." onRetry={() => query.refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications yet" description="Friend requests and challenges will show up here." />
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

      <div ref={sentinelRef} />
      {query.isFetchingNextPage && <LoadingSkeleton variant="list" count={2} />}
    </PageContainer>
  );
}
