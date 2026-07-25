import { apiClient } from "@/api/axiosClient";

/**
 * Any AI feature that needs a parsed resume (resume-analysis, job-description-analysis)
 * requires the resume-parser step to have completed first, but nothing else in the app
 * triggers it — callers chain this before hitting their own analyze endpoint.
 */

// /parse runs a synchronous AI call server-side — same rationale as the
// ANALYZE_TIMEOUT_MS overrides in each feature's analyze() call.
const PARSE_TIMEOUT_MS = 90_000;

export const resumeParserApi = {
  parse: async (resumeId: string): Promise<void> => {
    await apiClient.post("/resume-parser/parse", { resumeId }, { timeout: PARSE_TIMEOUT_MS });
  },
};
