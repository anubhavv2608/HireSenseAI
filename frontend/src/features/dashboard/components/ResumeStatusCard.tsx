import { ContentCard } from "@/components/common/ContentCard";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "../types/dashboard.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ResumeStatusCard({ summary }: { summary: DashboardSummary }) {
  return (
    <ContentCard title="Resume Status">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile completion</span>
            <span className="font-medium text-foreground">{summary.overallCompletion}%</span>
          </div>
          <Progress value={summary.overallCompletion} />
        </div>
        {summary.latestResume ? (
          <p className="text-sm text-muted-foreground">
            {summary.latestResume.originalFilename} (v{summary.latestResume.version}) &middot; uploaded{" "}
            {formatDate(summary.latestResume.uploadedAt)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
        )}
      </div>
    </ContentCard>
  );
}
