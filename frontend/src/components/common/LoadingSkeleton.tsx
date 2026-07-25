import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "text";
  count?: number;
}

export function LoadingSkeleton({ variant = "text", count = 3 }: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className="space-y-3 rounded-xl border border-border p-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}
