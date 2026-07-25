import { SectionCard } from "@/components/common/analysis/SectionCard";
import { TagList } from "@/components/common/analysis/TagList";

interface JobSkillsSectionProps {
  matchingSkills: string[];
  missingSkills: string[];
}

export function JobSkillsSection({ matchingSkills, missingSkills }: JobSkillsSectionProps) {
  return (
    <SectionCard title="Skills">
      <div className="space-y-4">
        <TagList label="Matching Skills" items={matchingSkills} tone="success" />
        <TagList label="Missing Skills" items={missingSkills} tone="warning" />
      </div>
    </SectionCard>
  );
}
