import { ScoreCard } from "@/components/common/analysis/ScoreCard";
import { MetricCard } from "@/components/common/analysis/MetricCard";
import { TagList } from "@/components/common/analysis/TagList";
import { SectionCard } from "@/components/common/analysis/SectionCard";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import type { HiringRecommendation } from "../types/jobAnalysis.types";

const HIRING_RECOMMENDATION_LABELS: Record<HiringRecommendation, string> = {
  STRONG_MATCH: "Strong Match",
  GOOD_MATCH: "Good Match",
  PARTIAL_MATCH: "Partial Match",
  WEAK_MATCH: "Weak Match",
};

const HIRING_RECOMMENDATION_TONES: Record<HiringRecommendation, StatusTone> = {
  STRONG_MATCH: "success",
  GOOD_MATCH: "info",
  PARTIAL_MATCH: "warning",
  WEAK_MATCH: "danger",
};

interface JobMatchSectionProps {
  overallMatchScore: number;
  keywordCoverage: number;
  hiringRecommendation: HiringRecommendation | null;
  matchingExperience: string[];
  experienceGaps: string[];
  educationMatch: string | null;
  projectRelevance: string | null;
}

export function JobMatchSection({
  overallMatchScore,
  keywordCoverage,
  hiringRecommendation,
  matchingExperience,
  experienceGaps,
  educationMatch,
  projectRelevance,
}: JobMatchSectionProps) {
  return (
    <div className="space-y-4">
      <SectionCard title="Match Overview">
        <div className="space-y-4">
          {hiringRecommendation && (
            <StatusBadge tone={HIRING_RECOMMENDATION_TONES[hiringRecommendation]}>
              {HIRING_RECOMMENDATION_LABELS[hiringRecommendation]}
            </StatusBadge>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScoreCard score={overallMatchScore} label="Match Score" />
            <MetricCard label="Keyword Coverage" value={keywordCoverage} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Experience Fit">
        <div className="space-y-4">
          <TagList label="Matching Experience" items={matchingExperience} tone="success" />
          <TagList label="Experience Gaps" items={experienceGaps} tone="warning" />
        </div>
      </SectionCard>

      {(educationMatch || projectRelevance) && (
        <SectionCard title="Education & Project Fit">
          <div className="space-y-3">
            {educationMatch && <p className="text-sm text-foreground">{educationMatch}</p>}
            {projectRelevance && <p className="text-sm text-foreground">{projectRelevance}</p>}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
