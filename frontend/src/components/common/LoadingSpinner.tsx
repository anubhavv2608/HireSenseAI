import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingSpinner({ label = "Loading...", fullPage = false, className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
        fullPage ? "min-h-screen" : "py-12",
        className,
      )}
    >
      <Spinner size="lg" />
      <span>{label}</span>
    </div>
  );
}
