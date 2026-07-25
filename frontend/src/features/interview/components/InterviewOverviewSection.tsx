import { SectionCard } from "@/components/common/analysis/SectionCard";
import { MetricCard } from "@/components/common/analysis/MetricCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DIFFICULTY_LABELS, DIFFICULTY_TONES } from "../utils/difficultyTone";
import type { QuestionDifficulty } from "../types/interview.types";

interface InterviewOverviewSectionProps {
  overallDifficulty: QuestionDifficulty;
  estimatedInterviewDuration: number;
}

export function InterviewOverviewSection({
  overallDifficulty,
  estimatedInterviewDuration,
}: InterviewOverviewSectionProps) {
  return (
    <SectionCard title="Overview">
      <div className="space-y-4">
        <StatusBadge tone={DIFFICULTY_TONES[overallDifficulty]}>{DIFFICULTY_LABELS[overallDifficulty]}</StatusBadge>
        <MetricCard label="Estimated Duration (minutes)" value={estimatedInterviewDuration} />
      </div>
    </SectionCard>
  );
}
