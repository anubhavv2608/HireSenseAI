import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { User } from "@/features/auth/types/auth.types";
import type {
  CompleteAssignmentResult,
  DailyDsaStatisticsSummary,
  HistoryItem,
  HistoryQuery,
  PaginatedResult,
  TodayAssignmentResult,
} from "../types/dailyDsa.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const dailyDsaApi = {
  getToday: (): Promise<TodayAssignmentResult> => unwrap(apiClient.get("/daily-dsa/today")),

  getHistory: (query: HistoryQuery): Promise<PaginatedResult<HistoryItem>> =>
    unwrap(apiClient.get("/daily-dsa/history", { params: query })),

  completeAssignment: (assignmentId: string): Promise<CompleteAssignmentResult> =>
    unwrap(apiClient.post("/daily-dsa/complete", { assignmentId })),

  enable: async (): Promise<User> => {
    const { user } = await unwrap<{ user: User }>(apiClient.post("/daily-dsa/enable"));
    return user;
  },

  getStatistics: async (): Promise<DailyDsaStatisticsSummary> => {
    const { statistics } = await unwrap<{ statistics: DailyDsaStatisticsSummary }>(apiClient.get("/statistics"));
    return statistics;
  },
};
