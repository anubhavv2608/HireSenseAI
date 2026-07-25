import { AnalysisHeader } from "@/components/common/analysis/AnalysisHeader";
import type { StatusTone } from "@/components/common/StatusBadge";

interface JobAnalysisHeaderProps {
  statusLabel: string;
  statusTone: StatusTone;
  subtitle?: string;
  summary?: string | null;
}

export function JobAnalysisHeader({ statusLabel, statusTone, subtitle, summary }: JobAnalysisHeaderProps) {
  return <AnalysisHeader status={statusLabel} statusTone={statusTone} subtitle={subtitle} summary={summary} />;
}
