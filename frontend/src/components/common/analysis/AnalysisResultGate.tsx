import type { ReactNode } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";

interface AnalysisResultGateProps<T> {
  isPending: boolean;
  isEmpty: boolean;
  isError: boolean;
  data: T | undefined;
  emptyState: ReactNode;
  errorDescription?: string;
  onRetry?: () => void;
  loadingSkeleton?: ReactNode;
  ariaLive?: boolean;
  className?: string;
  children: (data: T) => ReactNode;
}

export function AnalysisResultGate<T>({
  isPending,
  isEmpty,
  isError,
  data,
  emptyState,
  errorDescription,
  onRetry,
  loadingSkeleton,
  ariaLive = false,
  className,
  children,
}: AnalysisResultGateProps<T>) {
  const content = isPending ? (
    ariaLive ? (
      <div aria-hidden="true">{loadingSkeleton ?? <LoadingSkeleton variant="card" />}</div>
    ) : (
      (loadingSkeleton ?? <LoadingSkeleton variant="card" />)
    )
  ) : isEmpty ? (
    emptyState
  ) : isError ? (
    <ErrorState description={errorDescription} onRetry={onRetry} />
  ) : data ? (
    children(data)
  ) : null;

  if (!ariaLive) {
    return <>{content}</>;
  }

  return (
    <div aria-live="polite" aria-busy={isPending} className={className}>
      {content}
    </div>
  );
}
