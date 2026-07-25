export const jobAnalysisKeys = {
  all: ["job-analysis"] as const,
  latest: (resumeId: string) => [...jobAnalysisKeys.all, "latest", resumeId] as const,
};
