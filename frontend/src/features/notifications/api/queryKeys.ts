import type { NotificationsQuery } from "../types/notifications.types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (query?: NotificationsQuery) => [...notificationKeys.all, "list", query ?? {}] as const,
  // Deliberately its own namespace, separate from `list` — an infinite query's
  // cache shape ({ pages, pageParams }) is incompatible with a plain query's
  // ({ data, meta }), so they must never share a key even with matching params.
  infiniteList: () => [...notificationKeys.all, "infinite-list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};
