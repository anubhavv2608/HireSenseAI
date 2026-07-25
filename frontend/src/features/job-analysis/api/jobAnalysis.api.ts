import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { JobDescriptionAnalysis } from "../types/jobAnalysis.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

// /analyze runs a synchronous AI call server-side — the global 15s apiClient
// timeout is too short for it, same rationale as resumeAnalysisApi.analyze.
const ANALYZE_TIMEOUT_MS = 90_000;

export const jobAnalysisApi = {
  analyze: async (resumeId: string, jobDescription: string): Promise<JobDescriptionAnalysis> => {
    const { analysis } = await unwrap<{ analysis: JobDescriptionAnalysis }>(
      apiClient.post(
        "/job-description-analysis/analyze",
        { resumeId, jobDescription },
        { timeout: ANALYZE_TIMEOUT_MS },
      ),
    );
    return analysis;
  },

  getLatest: async (resumeId: string): Promise<JobDescriptionAnalysis> => {
    const { analysis } = await unwrap<{ analysis: JobDescriptionAnalysis }>(
      apiClient.get(`/job-description-analysis/${resumeId}`),
    );
    return analysis;
  },
};
