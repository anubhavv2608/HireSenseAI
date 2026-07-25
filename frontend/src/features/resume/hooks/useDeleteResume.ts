import { useMutation } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import { resumeKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import type { Resume } from "../types/resume.types";

export function useDeleteResume() {
  return useMutation({
    mutationFn: (id: string) => resumeApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.history() });
      const previousHistory = queryClient.getQueryData<Resume[]>(resumeKeys.history());
      if (previousHistory) {
        queryClient.setQueryData<Resume[]>(
          resumeKeys.history(),
          previousHistory.filter((resume) => resume._id !== id),
        );
      }
      return { previousHistory };
    },
    onError: (_error, _id, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(resumeKeys.history(), context.previousHistory);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.current() });
      queryClient.invalidateQueries({ queryKey: resumeKeys.history() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
