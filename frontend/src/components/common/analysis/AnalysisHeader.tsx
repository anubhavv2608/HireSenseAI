import type { ReactNode } from "react";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface AnalysisHeaderProps {
  status: string;
  statusLabel?: string;
  statusTone: StatusTone;
  subtitle?: string;
  summary?: string | null;
  actions?: ReactNode;
  className?: string;
}

export function AnalysisHeader({
  status,
  statusLabel,
  statusTone,
  subtitle,
  summary,
  actions,
  className,
}: AnalysisHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge tone={statusTone}>{statusLabel ?? status}</StatusBadge>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {summary && <p className="text-sm text-foreground">{summary}</p>}
    </div>
  );
}
