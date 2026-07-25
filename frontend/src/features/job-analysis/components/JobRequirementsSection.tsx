import { SectionCard } from "@/components/common/analysis/SectionCard";
import { TagList } from "@/components/common/analysis/TagList";
import type { ExtractedRequirements } from "../types/jobAnalysis.types";

interface JobRequirementsSectionProps {
  extractedRequirements: ExtractedRequirements | null;
  learningRoadmap: string[] | null;
}

export function JobRequirementsSection({ extractedRequirements, learningRoadmap }: JobRequirementsSectionProps) {
  if (!extractedRequirements && !learningRoadmap?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {extractedRequirements && (
        <SectionCard title="What This Role Asks For" description="Extracted directly from the job description.">
          <div className="space-y-4">
            <TagList label="Languages" items={extractedRequirements.languages} />
            <TagList label="Frameworks" items={extractedRequirements.frameworks} />
            <TagList label="Libraries" items={extractedRequirements.libraries} />
            <TagList label="Databases" items={extractedRequirements.databases} />
            <TagList label="Soft Skills" items={extractedRequirements.softSkills} />
            <TagList label="Required Qualifications" items={extractedRequirements.requiredQualifications} tone="danger" />
            <TagList label="Preferred Qualifications" items={extractedRequirements.preferredQualifications} />
            <TagList label="Responsibilities" items={extractedRequirements.responsibilities} />
          </div>
        </SectionCard>
      )}

      {learningRoadmap && learningRoadmap.length > 0 && (
        <SectionCard title="Learning Roadmap" description="Steps to close the gap for this role.">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {learningRoadmap.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}
