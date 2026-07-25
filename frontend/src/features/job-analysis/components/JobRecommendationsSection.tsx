import { SectionCard } from "@/components/common/analysis/SectionCard";
import { TagList } from "@/components/common/analysis/TagList";

function ProseList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

interface JobRecommendationsSectionProps {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priorityImprovements: string[];
}

export function JobRecommendationsSection({
  strengths,
  weaknesses,
  recommendations,
  priorityImprovements,
}: JobRecommendationsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Strengths">
          <ProseList items={strengths} emptyLabel="None identified." />
        </SectionCard>
        <SectionCard title="Weaknesses">
          <ProseList items={weaknesses} emptyLabel="None identified." />
        </SectionCard>
      </div>
      <SectionCard title="Recommendations">
        <div className="space-y-4">
          <ProseList items={recommendations} emptyLabel="No recommendations identified." />
          <TagList label="Priority Improvements" items={priorityImprovements} tone="danger" />
        </div>
      </SectionCard>
    </div>
  );
}
