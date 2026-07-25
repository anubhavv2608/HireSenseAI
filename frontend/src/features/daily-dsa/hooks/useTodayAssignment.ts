import { useQuery } from "@tanstack/react-query";
import { dailyDsaApi } from "../api/dailyDsa.api";
import { dailyDsaKeys } from "../api/queryKeys";

export function useTodayAssignment(enabled: boolean) {
  return useQuery({
    queryKey: dailyDsaKeys.today(),
    queryFn: dailyDsaApi.getToday,
    enabled,
  });
}
