import { useQuery } from "@tanstack/react-query";
import { jobAnalysisApi } from "../api/jobAnalysis.api";
import { jobAnalysisKeys } from "../api/queryKeys";
import { isApiError } from "@/api/apiError";

const STALE_TIME_MS = 5 * 60_000;

export function useLatestJobAnalysis(resumeId: string | undefined) {
  const query = useQuery({
    queryKey: jobAnalysisKeys.latest(resumeId ?? ""),
    queryFn: () => jobAnalysisApi.getLatest(resumeId as string),
    enabled: Boolean(resumeId),
    staleTime: STALE_TIME_MS,
  });

  const isEmpty = query.isError && isApiError(query.error) && query.error.status === 404;

  return { ...query, isEmpty };
}
