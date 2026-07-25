import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import type { StatusTone } from "@/components/common/StatusBadge";
import { JobAnalysisHeader } from "./JobAnalysisHeader";
import { JobMatchSection } from "./JobMatchSection";
import { JobSkillsSection } from "./JobSkillsSection";
import { JobRequirementsSection } from "./JobRequirementsSection";
import { JobRecommendationsSection } from "./JobRecommendationsSection";
import { isCompletedJobAnalysis, type JobAnalysisStatus, type JobDescriptionAnalysis } from "../types/jobAnalysis.types";

const STATUS_LABELS: Record<JobAnalysisStatus, string> = {
  PENDING: "Pending",
  ANALYZING: "Analyzing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  SKIPPED_ALREADY_ANALYZED: "Completed",
};

const STATUS_TONES: Record<JobAnalysisStatus, StatusTone> = {
  PENDING: "info",
  ANALYZING: "info",
  COMPLETED: "success",
  FAILED: "danger",
  SKIPPED_ALREADY_ANALYZED: "success",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function buildSubtitle(analysis: JobDescriptionAnalysis): string | undefined {
  const parts: string[] = [];
  if (analysis.analysisCompletedAt) {
    parts.push(`Analyzed ${formatDate(analysis.analysisCompletedAt)}`);
  }
  if (analysis.provider && analysis.aiModel) {
    parts.push(`${analysis.provider}/${analysis.aiModel}`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

interface JobAnalysisLayoutProps {
  analysis: JobDescriptionAnalysis;
}

export function JobAnalysisLayout({ analysis }: JobAnalysisLayoutProps) {
  return (
    <div className="space-y-8">
      <JobAnalysisHeader
        statusLabel={STATUS_LABELS[analysis.analysisStatus]}
        statusTone={STATUS_TONES[analysis.analysisStatus]}
        subtitle={buildSubtitle(analysis)}
        summary={analysis.summary}
      />

      {isCompletedJobAnalysis(analysis.analysisStatus) && (
        <>
          <JobMatchSection
            overallMatchScore={analysis.overallMatchScore as number}
            keywordCoverage={analysis.keywordCoverage as number}
            hiringRecommendation={analysis.hiringRecommendation}
            matchingExperience={analysis.matchingExperience ?? []}
            experienceGaps={analysis.experienceGaps ?? []}
            educationMatch={analysis.educationMatch}
            projectRelevance={analysis.projectRelevance}
          />
          <JobSkillsSection
            matchingSkills={analysis.matchingSkills ?? []}
            missingSkills={analysis.missingSkills ?? []}
          />
          <JobRequirementsSection
            extractedRequirements={analysis.extractedRequirements}
            learningRoadmap={analysis.learningRoadmap}
          />
          <JobRecommendationsSection
            strengths={analysis.strengths ?? []}
            weaknesses={analysis.weaknesses ?? []}
            recommendations={analysis.recommendations ?? []}
            priorityImprovements={analysis.priorityImprovements ?? []}
          />
        </>
      )}

      {analysis.analysisStatus === "FAILED" && (
        <ErrorState
          title="Analysis failed"
          description={analysis.errorMessage ?? "The AI analysis could not be completed."}
        />
      )}

      {(analysis.analysisStatus === "PENDING" || analysis.analysisStatus === "ANALYZING") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <span>Analysis in progress…</span>
        </div>
      )}
    </div>
  );
}
