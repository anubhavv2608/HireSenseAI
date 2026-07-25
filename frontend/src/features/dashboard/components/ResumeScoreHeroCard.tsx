import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { CircularScoreGauge } from "@/components/common/CircularScoreGauge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routePaths";
import type { DashboardSummary } from "../types/dashboard.types";

export function ResumeScoreHeroCard({ summary }: { summary: DashboardSummary }) {
  if (!summary.latestResume) {
    return (
      <ContentCard>
        <div className="flex flex-col items-center gap-3 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-foreground">No resume uploaded yet</p>
            <p className="text-sm text-muted-foreground">Upload a resume to get an AI-powered score and feedback.</p>
          </div>
          <Button asChild size="sm">
            <Link to={ROUTES.RESUME}>Upload Resume</Link>
          </Button>
        </div>
      </ContentCard>
    );
  }

  if (summary.latestResumeScore === null) {
    return (
      <ContentCard>
        <div className="flex flex-col items-center gap-3 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-foreground">Your resume hasn't been analyzed yet</p>
            <p className="text-sm text-muted-foreground">Run an analysis to see your score and detailed feedback.</p>
          </div>
          <Button asChild size="sm">
            <Link to={ROUTES.RESUME_ANALYSIS}>Analyze Resume</Link>
          </Button>
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-5">
          <CircularScoreGauge value={summary.latestResumeScore} size="lg" />
          <div>
            <p className="text-lg font-semibold text-foreground">Resume Score</p>
            <p className="text-sm text-muted-foreground">Based on your latest AI analysis</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.RESUME_ANALYSIS}>View Full Analysis</Link>
        </Button>
      </div>
    </ContentCard>
  );
}
