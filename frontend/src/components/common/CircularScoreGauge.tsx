import { cn } from "@/lib/utils";

type GaugeTone = "auto" | "primary" | "info" | "success" | "warning" | "destructive";

interface CircularScoreGaugeProps {
  value: number;
  max?: number;
  size?: "sm" | "lg";
  tone?: GaugeTone;
  label?: string;
  className?: string;
}

const TONE_STROKE: Record<Exclude<GaugeTone, "auto">, string> = {
  primary: "stroke-primary",
  info: "stroke-info",
  success: "stroke-success",
  warning: "stroke-warning",
  destructive: "stroke-destructive",
};

const SIZE_CONFIG = {
  sm: { box: "size-14", valueText: "text-sm", maxText: "text-[9px]", labelText: "text-[10px]", strokeWidth: 8 },
  lg: { box: "size-28", valueText: "text-3xl", maxText: "text-xs", labelText: "text-xs", strokeWidth: 7 },
} as const;

function deriveAutoTone(percentage: number): Exclude<GaugeTone, "auto"> {
  if (percentage >= 80) return "success";
  if (percentage >= 50) return "warning";
  return "destructive";
}

export function CircularScoreGauge({
  value,
  max = 100,
  size = "lg",
  tone = "auto",
  label,
  className,
}: CircularScoreGaugeProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const resolvedTone = tone === "auto" ? deriveAutoTone(percentage) : tone;
  const config = SIZE_CONFIG[size];

  const radius = 50 - config.strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className={cn("relative", config.box)}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn("transition-[stroke-dashoffset] duration-500", TONE_STROKE[resolvedTone])}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className={cn("font-semibold text-foreground", config.valueText)}>{Math.round(value)}</span>
          <span className={cn("text-muted-foreground", config.maxText)}>/{max}</span>
        </div>
      </div>
      {label && <span className={cn("text-center text-muted-foreground", config.labelText)}>{label}</span>}
    </div>
  );
}
