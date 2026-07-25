import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { ResumeAnalysis } from "../types/resumeAnalysis.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

// /analyze runs a synchronous AI call server-side (up to AI_TIMEOUT_MS per attempt,
// retried) — the global 15s apiClient timeout is too short for it.
const ANALYZE_TIMEOUT_MS = 90_000;

export const resumeAnalysisApi = {
  analyze: async (resumeId: string): Promise<ResumeAnalysis> => {
    const { analysis } = await unwrap<{ analysis: ResumeAnalysis }>(
      apiClient.post("/resume-analysis/analyze", { resumeId }, { timeout: ANALYZE_TIMEOUT_MS }),
    );
    return analysis;
  },

  getLatest: async (resumeId: string): Promise<ResumeAnalysis> => {
    const { analysis } = await unwrap<{ analysis: ResumeAnalysis }>(
      apiClient.get(`/resume-analysis/${resumeId}`),
    );
    return analysis;
  },
};
