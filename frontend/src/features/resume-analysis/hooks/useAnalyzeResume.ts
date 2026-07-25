import { useMutation } from "@tanstack/react-query";
import { resumeAnalysisApi } from "../api/resumeAnalysis.api";
import { resumeParserApi } from "@/api/resumeParser.api";
import { resumeAnalysisKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useAnalyzeResume() {
  return useMutation({
    mutationFn: async (resumeId: string) => {
      // resume-analysis requires the resume-parser step to have completed first;
      // nothing else in the app triggers it, so chain it here before analyzing.
      await resumeParserApi.parse(resumeId);
      return resumeAnalysisApi.analyze(resumeId);
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: resumeAnalysisKeys.latest(analysis.resumeId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
