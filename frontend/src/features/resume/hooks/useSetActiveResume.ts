import { useMutation } from "@tanstack/react-query";
import { resumeApi } from "../api/resume.api";
import { resumeKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import type { Resume } from "../types/resume.types";

export function useSetActiveResume() {
  return useMutation({
    mutationFn: (id: string) => resumeApi.setActive(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.history() });
      await queryClient.cancelQueries({ queryKey: resumeKeys.current() });

      const previousHistory = queryClient.getQueryData<Resume[]>(resumeKeys.history());
      const previousCurrent = queryClient.getQueryData<Resume>(resumeKeys.current());

      if (previousHistory) {
        queryClient.setQueryData<Resume[]>(
          resumeKeys.history(),
          previousHistory.map((resume) => ({ ...resume, isActive: resume._id === id })),
        );
        const nextActive = previousHistory.find((resume) => resume._id === id);
        if (nextActive) {
          queryClient.setQueryData<Resume>(resumeKeys.current(), { ...nextActive, isActive: true });
        }
      }

      return { previousHistory, previousCurrent };
    },
    onError: (_error, _id, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(resumeKeys.history(), context.previousHistory);
      }
      if (context?.previousCurrent) {
        queryClient.setQueryData(resumeKeys.current(), context.previousCurrent);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.current() });
      queryClient.invalidateQueries({ queryKey: resumeKeys.history() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}
