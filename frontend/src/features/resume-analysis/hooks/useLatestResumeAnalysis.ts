import { useQuery } from "@tanstack/react-query";
import { resumeAnalysisApi } from "../api/resumeAnalysis.api";
import { resumeAnalysisKeys } from "../api/queryKeys";
import { isApiError } from "@/api/apiError";

const STALE_TIME_MS = 5 * 60_000;

export function useLatestResumeAnalysis(resumeId: string | undefined) {
  const query = useQuery({
    queryKey: resumeAnalysisKeys.latest(resumeId ?? ""),
    queryFn: () => resumeAnalysisApi.getLatest(resumeId as string),
    enabled: Boolean(resumeId),
    staleTime: STALE_TIME_MS,
  });

  const isEmpty = query.isError && isApiError(query.error) && query.error.status === 404;

  return { ...query, isEmpty };
}
