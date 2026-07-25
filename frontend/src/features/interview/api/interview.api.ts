import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { InterviewGeneration } from "../types/interview.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

// /generate and /regenerate run a synchronous AI call server-side — same
// rationale as the ANALYZE_TIMEOUT_MS override in jobAnalysisApi.analyze.
const GENERATE_TIMEOUT_MS = 90_000;

export const interviewApi = {
  generate: async (resumeId: string): Promise<InterviewGeneration> => {
    const { generation } = await unwrap<{ generation: InterviewGeneration }>(
      apiClient.post("/interview-generator/generate", { resumeId }, { timeout: GENERATE_TIMEOUT_MS }),
    );
    return generation;
  },

  regenerate: async (resumeId: string): Promise<InterviewGeneration> => {
    const { generation } = await unwrap<{ generation: InterviewGeneration }>(
      apiClient.post("/interview-generator/regenerate", { resumeId }, { timeout: GENERATE_TIMEOUT_MS }),
    );
    return generation;
  },

  getLatest: async (resumeId: string): Promise<InterviewGeneration> => {
    const { generation } = await unwrap<{ generation: InterviewGeneration }>(
      apiClient.get(`/interview-generator/${resumeId}`),
    );
    return generation;
  },
};
