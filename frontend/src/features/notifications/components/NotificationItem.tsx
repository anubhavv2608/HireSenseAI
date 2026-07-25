import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NOTIFICATION_ICONS } from "./notificationCopy";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import type { Notification } from "../types/notifications.types";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];

  const content = (
    <div
      className={cn(
        "flex gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className={cn("truncate font-medium text-foreground", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        <p className="line-clamp-2 text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
    </div>
  );

  function handleClick() {
    if (!notification.isRead) {
      onRead?.(notification._id);
    }
  }

  if (notification.link) {
    return (
      <Link to={notification.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {content}
    </button>
  );
}
