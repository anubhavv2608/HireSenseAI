import { SectionCard } from "@/components/common/analysis/SectionCard";
import type { ResumeAnalysis } from "../types/resumeAnalysis.types";

function ProseList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None identified.</p>;
  }
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

interface ResumeInsightsSectionProps {
  analysis: ResumeAnalysis;
}

export function ResumeInsightsSection({ analysis }: ResumeInsightsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SectionCard title="Strengths">
        <ProseList items={analysis.strengths ?? []} />
      </SectionCard>
      <SectionCard title="Weaknesses">
        <ProseList items={analysis.weaknesses ?? []} />
      </SectionCard>
    </div>
  );
}
