import { useMutation } from "@tanstack/react-query";
import { dailyDsaApi } from "../api/dailyDsa.api";
import { dailyDsaKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { CompleteAssignmentResult, TodayAssignmentResult } from "../types/dailyDsa.types";

export function useCompleteAssignment() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (assignmentId: string) => dailyDsaApi.completeAssignment(assignmentId),
    onSuccess: (result: CompleteAssignmentResult) => {
      updateUser(result.stats);

      queryClient.setQueryData<TodayAssignmentResult>(dailyDsaKeys.today(), (previous) =>
        previous ? { ...previous, completed: true, completedAt: result.completion.completedAt } : previous,
      );

      queryClient.invalidateQueries({ queryKey: dailyDsaKeys.history() });
      queryClient.invalidateQueries({ queryKey: dailyDsaKeys.statistics() });
    },
  });
}
