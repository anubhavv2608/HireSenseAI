import type { LeaderboardQuery } from "../types/leaderboard.types";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  list: (query?: LeaderboardQuery) => [...leaderboardKeys.all, "list", query ?? {}] as const,
};
