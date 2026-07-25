export const interviewKeys = {
  all: ["interview"] as const,
  latest: (resumeId: string) => [...interviewKeys.all, "latest", resumeId] as const,
};
