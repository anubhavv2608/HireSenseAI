import { AnalysisHeader } from "@/components/common/analysis/AnalysisHeader";
import type { StatusTone } from "@/components/common/StatusBadge";
import type { ResumeAnalysis, ResumeAnalysisStatus } from "../types/resumeAnalysis.types";

const STATUS_LABELS: Record<ResumeAnalysisStatus, string> = {
  PENDING: "Pending",
  ANALYZING: "Analyzing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  SKIPPED_ALREADY_ANALYZED: "Completed",
};

const STATUS_TONES: Record<ResumeAnalysisStatus, StatusTone> = {
  PENDING: "info",
  ANALYZING: "info",
  COMPLETED: "success",
  FAILED: "danger",
  SKIPPED_ALREADY_ANALYZED: "success",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function buildSubtitle(analysis: ResumeAnalysis): string | undefined {
  const parts: string[] = [];
  if (analysis.analysisCompletedAt) {
    parts.push(`Analyzed ${formatDate(analysis.analysisCompletedAt)}`);
  }
  if (analysis.provider && analysis.aiModel) {
    parts.push(`${analysis.provider}/${analysis.aiModel}`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

interface ResumeAnalysisHeaderProps {
  analysis: ResumeAnalysis;
}

export function ResumeAnalysisHeader({ analysis }: ResumeAnalysisHeaderProps) {
  return (
    <AnalysisHeader
      status={analysis.analysisStatus}
      statusLabel={STATUS_LABELS[analysis.analysisStatus]}
      statusTone={STATUS_TONES[analysis.analysisStatus]}
      subtitle={buildSubtitle(analysis)}
      summary={analysis.summary}
    />
  );
}
