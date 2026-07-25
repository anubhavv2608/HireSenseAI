import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { formatRelativeTime } from "@/features/notifications/utils/formatRelativeTime";
import { NOTIFICATION_ICONS } from "@/features/notifications/components/notificationCopy";

const ACTIVITY_TYPES = new Set(["friend_accepted", "challenge_completed"]);
const PREVIEW_LIMIT = 5;

export function CommunityActivityWidget() {
  const query = useNotifications({ limit: 20 });
  const activity = (query.data?.data ?? []).filter((item) => ACTIVITY_TYPES.has(item.type)).slice(0, PREVIEW_LIMIT);

  return (
    <ContentCard title="Community Activity" description="Recent friend and challenge outcomes">
      {query.isPending ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : activity.length === 0 ? (
        <EmptyState title="No recent activity" className="border-none p-0 py-4" />
      ) : (
        <div className="space-y-3">
          {activity.map((item) => {
            const Icon = NOTIFICATION_ICONS[item.type];
            return (
              <div key={item._id} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ContentCard>
  );
}
