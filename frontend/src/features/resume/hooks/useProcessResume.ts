import { useMutation } from "@tanstack/react-query";
import { resumeProcessingApi } from "../api/resumeProcessing.api";

export function useProcessResume() {
  return useMutation({
    mutationFn: (resumeId: string) => resumeProcessingApi.process(resumeId),
  });
}
