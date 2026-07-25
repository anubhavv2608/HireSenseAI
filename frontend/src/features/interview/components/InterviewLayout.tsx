import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import type { StatusTone } from "@/components/common/StatusBadge";
import { InterviewHeader } from "./InterviewHeader";
import { InterviewOverviewSection } from "./InterviewOverviewSection";
import { QuestionListSection } from "./QuestionListSection";
import { isCompletedInterview, type GenerationStatus, type InterviewGeneration } from "../types/interview.types";

const STATUS_LABELS: Record<GenerationStatus, string> = {
  PENDING: "Pending",
  GENERATING: "Generating",
  COMPLETED: "Completed",
  FAILED: "Failed",
  SKIPPED_ALREADY_GENERATED: "Completed",
};

const STATUS_TONES: Record<GenerationStatus, StatusTone> = {
  PENDING: "info",
  GENERATING: "info",
  COMPLETED: "success",
  FAILED: "danger",
  SKIPPED_ALREADY_GENERATED: "success",
};

interface InterviewLayoutProps {
  generation: InterviewGeneration;
}

export function InterviewLayout({ generation }: InterviewLayoutProps) {
  return (
    <div className="space-y-8">
      <InterviewHeader
        statusLabel={STATUS_LABELS[generation.generationStatus]}
        statusTone={STATUS_TONES[generation.generationStatus]}
      />

      {isCompletedInterview(generation.generationStatus) && generation.questions && (
        <>
          <InterviewOverviewSection
            overallDifficulty={generation.questions.overallDifficulty}
            estimatedInterviewDuration={generation.questions.estimatedInterviewDuration}
          />
          <QuestionListSection title="Technical Questions" questions={generation.questions.technicalQuestions} />
          <QuestionListSection title="Behavioral Questions" questions={generation.questions.behavioralQuestions} />
          <QuestionListSection title="Project Questions" questions={generation.questions.projectQuestions} />
          <QuestionListSection title="Experience Questions" questions={generation.questions.experienceQuestions} />
          <QuestionListSection title="Follow-up Questions" questions={generation.questions.followUpQuestions} />
        </>
      )}

      {generation.generationStatus === "FAILED" && (
        <ErrorState
          title="Generation failed"
          description={generation.errorMessage ?? "The AI could not generate interview questions."}
        />
      )}

      {(generation.generationStatus === "PENDING" || generation.generationStatus === "GENERATING") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <span>Generating interview questions…</span>
        </div>
      )}
    </div>
  );
}
