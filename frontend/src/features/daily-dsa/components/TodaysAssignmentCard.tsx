import { ContentCard } from "@/components/common/ContentCard";
import { ProblemCard } from "./ProblemCard";
import { CompletionButton } from "./CompletionButton";
import type { TodayAssignmentResult } from "../types/dailyDsa.types";

interface TodaysAssignmentCardProps {
  today: TodayAssignmentResult;
}

export function TodaysAssignmentCard({ today }: TodaysAssignmentCardProps) {
  return (
    <ContentCard title="Today's Challenge">
      <div className="space-y-4">
        <ProblemCard assignment={today.assignment} />
        <CompletionButton
          assignmentId={today.assignment._id}
          completed={today.completed}
          completedAt={today.completedAt}
        />
      </div>
    </ContentCard>
  );
}
