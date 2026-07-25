import { SectionCard } from "@/components/common/analysis/SectionCard";
import { TagList } from "@/components/common/analysis/TagList";
import type { ResumeAnalysis } from "../types/resumeAnalysis.types";

interface ResumeRecommendationsSectionProps {
  analysis: ResumeAnalysis;
}

export function ResumeRecommendationsSection({ analysis }: ResumeRecommendationsSectionProps) {
  const recommendations = analysis.recommendations ?? [];

  return (
    <div className="space-y-4">
      <SectionCard title="Recommendations">
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations identified.</p>
        ) : (
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </SectionCard>
      <SectionCard title="Areas to Improve">
        <div className="space-y-4">
          <TagList label="Missing Sections" items={analysis.missingSections ?? []} tone="warning" />
          <TagList label="Priority Improvements" items={analysis.priorityImprovements ?? []} tone="danger" />
        </div>
      </SectionCard>
    </div>
  );
}
