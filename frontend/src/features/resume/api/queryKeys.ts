export const resumeKeys = {
  all: ["resume"] as const,
  current: () => [...resumeKeys.all, "current"] as const,
  history: () => [...resumeKeys.all, "history"] as const,
  processingStatus: (resumeId: string) => [...resumeKeys.all, "processing-status", resumeId] as const,
  processingDetail: (resumeId: string) => [...resumeKeys.all, "processing-detail", resumeId] as const,
};
