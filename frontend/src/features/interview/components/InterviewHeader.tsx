import { AnalysisHeader } from "@/components/common/analysis/AnalysisHeader";
import type { StatusTone } from "@/components/common/StatusBadge";

interface InterviewHeaderProps {
  statusLabel: string;
  statusTone: StatusTone;
  subtitle?: string;
}

export function InterviewHeader({ statusLabel, statusTone, subtitle }: InterviewHeaderProps) {
  return <AnalysisHeader status={statusLabel} statusTone={statusTone} subtitle={subtitle} />;
}
