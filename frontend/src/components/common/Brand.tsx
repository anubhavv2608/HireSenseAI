import { cn } from "@/lib/utils";

const BADGE_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "size-6 text-xs rounded-md",
  md: "size-8 text-sm rounded-lg",
  lg: "size-12 text-xl rounded-xl",
};

const WORDMARK_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

const TONE_CLASSES: Record<"solid" | "on-dark", string> = {
  solid: "bg-primary text-primary-foreground",
  "on-dark": "bg-white/15 text-white",
};

interface BrandProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  tone?: "solid" | "on-dark";
  className?: string;
}

export function Brand({ size = "md", withWordmark = false, tone = "solid", className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center font-bold tracking-tight",
          BADGE_SIZE[size],
          TONE_CLASSES[tone],
        )}
        aria-hidden="true"
      >
        H
      </div>
      {withWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            WORDMARK_SIZE[size],
            tone === "on-dark" ? "text-white" : "text-foreground",
          )}
        >
          HireSense AI
        </span>
      )}
    </div>
  );
}
