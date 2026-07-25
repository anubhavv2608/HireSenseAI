import type { HistoryQuery } from "../types/dailyDsa.types";

export const dailyDsaKeys = {
  all: ["daily-dsa"] as const,
  today: () => [...dailyDsaKeys.all, "today"] as const,
  history: (query?: HistoryQuery) => [...dailyDsaKeys.all, "history", query ?? {}] as const,
  statistics: () => [...dailyDsaKeys.all, "statistics"] as const,
};
