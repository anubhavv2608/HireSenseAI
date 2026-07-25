import { useMutation } from "@tanstack/react-query";
import { interviewApi } from "../api/interview.api";
import { interviewKeys } from "../api/queryKeys";
import { resumeParserApi } from "@/api/resumeParser.api";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useGenerateInterview() {
  return useMutation({
    mutationFn: async (resumeId: string) => {
      // interview-generator requires the resume-parser step to have completed
      // first; nothing else in the app triggers it, so chain it here before generating.
      await resumeParserApi.parse(resumeId);
      return interviewApi.generate(resumeId);
    },
    onSuccess: (generation) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.latest(generation.resumeId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
