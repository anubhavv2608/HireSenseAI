import { useQuery } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import { resumeKeys } from "../api/queryKeys";

export function useResumeHistory() {
  return useQuery({
    queryKey: resumeKeys.history(),
    queryFn: resumeApi.getHistory,
  });
}
