import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "../api/leaderboard.api";
import { leaderboardKeys } from "../api/queryKeys";
import type { LeaderboardQuery } from "../types/leaderboard.types";

const STALE_TIME_MS = 5 * 60_000;

export function useLeaderboard(query: LeaderboardQuery) {
  return useQuery({
    queryKey: leaderboardKeys.list(query),
    queryFn: () => leaderboardApi.getLeaderboard(query),
    staleTime: STALE_TIME_MS,
  });
}
