import { CheckCircle2, Circle } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { cn } from "@/lib/utils";
import type { TimelineEntry, TimelineStage } from "../types/dashboard.types";

const STAGE_LABELS: Record<TimelineStage, string> = {
  RESUME_UPLOADED: "Resume uploaded",
  RESUME_PARSED: "Resume parsed",
  RESUME_ANALYZED: "Resume analyzed",
  JD_COMPARED: "Job description compared",
  INTERVIEW_GENERATED: "Interview questions generated",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function RecentActivityTimeline({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <ContentCard title="Recent Activity">
      <ul className="space-y-3">
        {timeline.map((entry) => (
          <li key={entry.stage} className="flex items-center gap-3">
            {entry.completed ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <span className={cn("text-sm", entry.completed ? "text-foreground" : "text-muted-foreground")}>
              {STAGE_LABELS[entry.stage]}
            </span>
            {entry.completedAt && (
              <span className="ml-auto text-xs text-muted-foreground">{formatDate(entry.completedAt)}</span>
            )}
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}
