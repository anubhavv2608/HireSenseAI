import { useQuery } from "@tanstack/react-query";
import { dailyDsaApi } from "../api/dailyDsa.api";
import { dailyDsaKeys } from "../api/queryKeys";
import type { HistoryQuery } from "../types/dailyDsa.types";

export function useDailyDsaHistory(query: HistoryQuery, enabled: boolean) {
  return useQuery({
    queryKey: dailyDsaKeys.history(query),
    queryFn: () => dailyDsaApi.getHistory(query),
    enabled,
  });
}
