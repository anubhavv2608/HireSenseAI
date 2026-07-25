import { useQuery } from "@tanstack/react-query";
import { resumeProcessingApi } from "../api/resumeProcessing.api";
import { resumeKeys } from "../api/queryKeys";
import { isApiError } from "@/api/apiError";
import type { ProcessingStatusSummary } from "../types/resume.types";

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "SKIPPED_DUPLICATE"]);
const POLL_INTERVAL_MS = 3000;

export function useProcessingStatus(resumeId: string | undefined) {
  const query = useQuery({
    queryKey: resumeKeys.processingStatus(resumeId ?? ""),
    queryFn: () => resumeProcessingApi.getStatus(resumeId as string),
    enabled: Boolean(resumeId),
    refetchInterval: (query) => {
      const status = (query.state.data as ProcessingStatusSummary | undefined)?.processingStatus;
      if (status && TERMINAL_STATUSES.has(status)) return false;

      // No terminal answer yet: still loading, actively PENDING/PROCESSING, or the
      // processing record doesn't exist yet (404) because the chained upload->process
      // call hasn't finished creating it. Keep polling through all of these - the 404
      // window is normally just the ~1-2s the synchronous /process call takes.
      const error = query.state.error;
      const isNotStarted404 = isApiError(error) && error.status === 404;
      if (!error || isNotStarted404) return POLL_INTERVAL_MS;

      // A genuine non-404 error (network/server) - stop hammering, let the user retry manually.
      return false;
    },
  });

  const isNotStarted = query.isError && isApiError(query.error) && query.error.status === 404;

  return { ...query, isNotStarted };
}
