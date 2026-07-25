import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { dashboardKeys } from "../api/queryKeys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardApi.getSummary,
  });
}
