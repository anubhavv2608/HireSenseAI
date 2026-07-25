export const resumeAnalysisKeys = {
  all: ["resume-analysis"] as const,
  latest: (resumeId: string) => [...resumeAnalysisKeys.all, "latest", resumeId] as const,
};
