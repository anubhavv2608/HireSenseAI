import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/common/EmptyState";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { NotificationItem } from "./NotificationItem";
import { ROUTES } from "@/routes/routePaths";

const PREVIEW_LIMIT = 8;

export function NotificationBell() {
  const unreadCountQuery = useUnreadCount();
  const notificationsQuery = useNotifications({ limit: PREVIEW_LIMIT });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data?.data ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-full p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-normal"
              onClick={(event) => {
                event.preventDefault();
                markAllReadMutation.mutate();
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" className="border-none py-8" />
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification._id} asChild className="rounded-none p-0 focus:bg-transparent">
                <NotificationItem notification={notification} onRead={(id) => markReadMutation.mutate(id)} />
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem asChild className="justify-center rounded-none p-0">
          <Link to={ROUTES.NOTIFICATIONS} className="w-full py-2 text-center text-sm">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
