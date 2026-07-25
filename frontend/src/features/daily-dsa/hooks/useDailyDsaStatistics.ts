import { useQuery } from "@tanstack/react-query";
import { dailyDsaApi } from "../api/dailyDsa.api";
import { dailyDsaKeys } from "../api/queryKeys";

export function useDailyDsaStatistics(enabled: boolean) {
  return useQuery({
    queryKey: dailyDsaKeys.statistics(),
    queryFn: dailyDsaApi.getStatistics,
    enabled,
  });
}
