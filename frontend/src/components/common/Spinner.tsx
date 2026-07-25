import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}
