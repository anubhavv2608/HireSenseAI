import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileTrend {
  direction: "up" | "down" | "flat";
  label: string;
}

interface StatTileProps {
  icon?: LucideIcon;
  value: ReactNode;
  label: string;
  description?: ReactNode;
  trend?: StatTileTrend;
  className?: string;
}

const TREND_ICON: Record<StatTileTrend["direction"], LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: ArrowRight,
};

const TREND_TONE: Record<StatTileTrend["direction"], string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

export function StatTile({ icon: Icon, value, label, description, trend, className }: StatTileProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xl font-semibold text-foreground">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
      {trend && TrendIcon && (
        <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", TREND_TONE[trend.direction])}>
          <TrendIcon className="size-3" aria-hidden="true" />
          {trend.label}
        </p>
      )}
    </div>
  );
}
