import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/apiError";

const NON_RETRIABLE_STATUSES = [401, 403, 404, 422];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status !== null && NON_RETRIABLE_STATUSES.includes(error.status)) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
