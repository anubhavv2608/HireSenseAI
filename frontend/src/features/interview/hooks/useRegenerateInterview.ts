import { useMutation } from "@tanstack/react-query";
import { interviewApi } from "../api/interview.api";
import { interviewKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useRegenerateInterview() {
  return useMutation({
    mutationFn: (resumeId: string) => interviewApi.regenerate(resumeId),
    onSuccess: (generation) => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.latest(generation.resumeId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
