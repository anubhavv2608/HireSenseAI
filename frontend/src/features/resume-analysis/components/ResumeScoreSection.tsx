import { ScoreCard } from "@/components/common/analysis/ScoreCard";
import { MetricCard } from "@/components/common/analysis/MetricCard";
import { SectionCard } from "@/components/common/analysis/SectionCard";
import type { ResumeAnalysis, ResumeAnalysisCategoryScores } from "../types/resumeAnalysis.types";

const CATEGORY_LABELS: Record<keyof ResumeAnalysisCategoryScores, string> = {
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  leadership: "Leadership",
  completeness: "Completeness",
};

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as (keyof ResumeAnalysisCategoryScores)[];

interface ResumeScoreSectionProps {
  analysis: ResumeAnalysis;
}

export function ResumeScoreSection({ analysis }: ResumeScoreSectionProps) {
  const categoryScores = analysis.categoryScores as ResumeAnalysisCategoryScores;

  return (
    <div className="space-y-4">
      <ScoreCard score={analysis.overallScore as number} label="Overall Score" />
      <SectionCard title="Category Scores">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORY_KEYS.map((key) => (
            <MetricCard key={key} label={CATEGORY_LABELS[key]} value={categoryScores[key]} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
