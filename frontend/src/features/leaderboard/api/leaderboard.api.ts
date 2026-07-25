import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { LeaderboardQuery, LeaderboardResult } from "../types/leaderboard.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const leaderboardApi = {
  getLeaderboard: (query: LeaderboardQuery): Promise<LeaderboardResult> =>
    unwrap(apiClient.get("/leaderboard", { params: query })),
};
