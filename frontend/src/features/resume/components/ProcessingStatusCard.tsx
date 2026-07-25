import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Spinner } from "@/components/common/Spinner";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { useProcessingStatus } from "../hooks/useProcessingStatus";
import { useProcessingDetail } from "../hooks/useProcessingDetail";
import { useProcessResume } from "../hooks/useProcessResume";
import { resumeKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import type { ProcessingStatus } from "../types/resume.types";

const TERMINAL_STATUSES: ProcessingStatus[] = ["COMPLETED", "FAILED", "SKIPPED_DUPLICATE"];

interface ProcessingStatusCardProps {
  resumeId: string;
}

export function ProcessingStatusCard({ resumeId }: ProcessingStatusCardProps) {
  const { data, isPending, isNotStarted, isError, refetch } = useProcessingStatus(resumeId);
  const processResume = useProcessResume();
  const isCompleted = data?.processingStatus === "COMPLETED";
  const { data: detail } = useProcessingDetail(resumeId, isCompleted);

  const settledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data) return;
    const key = `${resumeId}:${data.processingStatus}`;
    if (TERMINAL_STATUSES.includes(data.processingStatus) && settledRef.current !== key) {
      settledRef.current = key;
      queryClient.invalidateQueries({ queryKey: resumeKeys.current() });
      queryClient.invalidateQueries({ queryKey: resumeKeys.history() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    }
  }, [data, resumeId]);

  if (isPending) {
    return (
      <ContentCard title="Processing">
        <LoadingSkeleton variant="text" count={2} />
      </ContentCard>
    );
  }

  if (isNotStarted) {
    return (
      <ContentCard title="Processing">
        <p className="text-sm text-muted-foreground">Not yet processed.</p>
      </ContentCard>
    );
  }

  if (isError || !data) {
    return (
      <ContentCard title="Processing">
        <ErrorState description="Couldn't load processing status." onRetry={() => refetch()} />
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Processing">
      <div className="space-y-3">
        {(data.processingStatus === "PENDING" || data.processingStatus === "PROCESSING") && (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Spinner size="sm" />
            <span>Processing your resume...</span>
          </div>
        )}

        {data.processingStatus === "COMPLETED" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span>Processing complete</span>
            </div>
            {detail?.pdfMetadata && (
              <p className="text-sm text-muted-foreground">
                {detail.pdfMetadata.pages} page{detail.pdfMetadata.pages === 1 ? "" : "s"} &middot;{" "}
                {detail.pdfMetadata.wordCount} words extracted
              </p>
            )}
          </div>
        )}

        {data.processingStatus === "SKIPPED_DUPLICATE" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            <span>Already processed (duplicate content).</span>
          </div>
        )}

        {data.processingStatus === "FAILED" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" aria-hidden="true" />
              <span>Processing failed</span>
            </div>
            {data.errorMessage && <p className="text-sm text-muted-foreground">{data.errorMessage}</p>}
            <Button
              size="sm"
              variant="outline"
              onClick={() => processResume.mutate(resumeId)}
              disabled={processResume.isPending}
            >
              {processResume.isPending ? "Retrying..." : "Retry processing"}
            </Button>
          </div>
        )}
      </div>
    </ContentCard>
  );
}
