import { SectionCard } from "@/components/common/analysis/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DIFFICULTY_TONES } from "../utils/difficultyTone";
import type { InterviewQuestion } from "../types/interview.types";

interface QuestionListSectionProps {
  title: string;
  description?: string;
  questions: InterviewQuestion[];
  emptyLabel?: string;
}

export function QuestionListSection({
  title,
  description,
  questions,
  emptyLabel = "No questions generated for this category.",
}: QuestionListSectionProps) {
  return (
    <SectionCard title={title} description={description}>
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((item, index) => (
            <li key={index} className="space-y-1.5 rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                <StatusBadge tone={DIFFICULTY_TONES[item.difficulty]} className="shrink-0">
                  {item.difficulty}
                </StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground">{item.reason}</p>
              {item.relatedSkill && (
                <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.relatedSkill}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
