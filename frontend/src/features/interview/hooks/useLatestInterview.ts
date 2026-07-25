import { useQuery } from "@tanstack/react-query";
import { interviewApi } from "../api/interview.api";
import { interviewKeys } from "../api/queryKeys";
import { isApiError } from "@/api/apiError";

const STALE_TIME_MS = 5 * 60_000;

export function useLatestInterview(resumeId: string | undefined) {
  const query = useQuery({
    queryKey: interviewKeys.latest(resumeId ?? ""),
    queryFn: () => interviewApi.getLatest(resumeId as string),
    enabled: Boolean(resumeId),
    staleTime: STALE_TIME_MS,
  });

  const isEmpty = query.isError && isApiError(query.error) && query.error.status === 404;

  return { ...query, isEmpty };
}
