import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import { notificationKeys } from "../api/queryKeys";

const PAGE_SIZE = 20;

export function useNotificationsInfinite() {
  return useInfiniteQuery({
    queryKey: notificationKeys.infiniteList(),
    queryFn: ({ pageParam }) => notificationsApi.list({ page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined),
  });
}
