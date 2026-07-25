import { useQuery } from "@tanstack/react-query";
import { resumeProcessingApi } from "../api/resumeProcessing.api";
import { resumeKeys } from "../api/queryKeys";

export function useProcessingDetail(resumeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: resumeKeys.processingDetail(resumeId ?? ""),
    queryFn: () => resumeProcessingApi.getDetail(resumeId as string),
    enabled: Boolean(resumeId) && enabled,
  });
}
