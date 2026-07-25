import { useMutation } from "@tanstack/react-query";
import { jobAnalysisApi } from "../api/jobAnalysis.api";
import { jobAnalysisKeys } from "../api/queryKeys";
import { resumeParserApi } from "@/api/resumeParser.api";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";

interface AnalyzeJobVariables {
  resumeId: string;
  jobDescription: string;
}

export function useAnalyzeJob() {
  return useMutation({
    mutationFn: async ({ resumeId, jobDescription }: AnalyzeJobVariables) => {
      // job-description-analysis requires the resume-parser step to have completed
      // first; nothing else in the app triggers it, so chain it here before analyzing.
      await resumeParserApi.parse(resumeId);
      return jobAnalysisApi.analyze(resumeId, jobDescription);
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: jobAnalysisKeys.latest(analysis.resumeId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
