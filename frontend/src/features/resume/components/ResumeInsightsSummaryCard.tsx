import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { CircularScoreGauge } from "@/components/common/CircularScoreGauge";
import { AnalyzeResumeButton } from "@/features/resume-analysis/components/AnalyzeResumeButton";
import { useLatestResumeAnalysis } from "@/features/resume-analysis/hooks/useLatestResumeAnalysis";
import { ROUTES } from "@/routes/routePaths";

const CATEGORY_LABELS: Record<string, string> = {
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  leadership: "Leadership",
  completeness: "Completeness",
};

export function ResumeInsightsSummaryCard({ resumeId }: { resumeId: string }) {
  const analysis = useLatestResumeAnalysis(resumeId);

  if (analysis.isPending) {
    return <LoadingSkeleton variant="card" />;
  }

  if (analysis.isEmpty || !analysis.data || analysis.data.overallScore === null || !analysis.data.categoryScores) {
    return (
      <ContentCard title="Resume Insights">
        <div className="flex flex-col items-center gap-3 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-foreground">No analysis yet</p>
            <p className="text-sm text-muted-foreground">Analyze your resume to see your score and feedback.</p>
          </div>
          <AnalyzeResumeButton resumeId={resumeId} hasExistingAnalysis={false} />
        </div>
      </ContentCard>
    );
  }

  const { overallScore, categoryScores, strengths } = analysis.data;

  return (
    <ContentCard title="Resume Insights">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:w-64 md:shrink-0 md:border-r md:border-border md:pr-6">
          <CircularScoreGauge value={overallScore} size="lg" label="Overall Score" />
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(categoryScores).map(([key, value]) => (
              <CircularScoreGauge key={key} value={value} size="sm" label={CATEGORY_LABELS[key] ?? key} />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium text-foreground">Top Strengths</p>
          {strengths && strengths.length > 0 ? (
            <ul className="space-y-1.5">
              {strengths.slice(0, 5).map((strength) => (
                <li key={strength} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
          )}
          <Link
            to={ROUTES.RESUME_ANALYSIS}
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            View Full Analysis
          </Link>
        </div>
      </div>
    </ContentCard>
  );
}
