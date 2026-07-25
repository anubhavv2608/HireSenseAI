import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { DashboardSummary } from "../types/dashboard.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { dashboard } = await unwrap<{ dashboard: DashboardSummary }>(apiClient.get("/dashboard"));
    return dashboard;
  },
};
