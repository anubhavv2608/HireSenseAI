import { FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useCurrentResume } from "@/features/resume/hooks/useCurrentResume";
import { useLatestResumeAnalysis } from "@/features/resume-analysis/hooks/useLatestResumeAnalysis";
import { AnalyzeResumeButton } from "@/features/resume-analysis/components/AnalyzeResumeButton";
import { ResumeAnalysisHeader } from "@/features/resume-analysis/components/ResumeAnalysisHeader";
import { ResumeScoreSection } from "@/features/resume-analysis/components/ResumeScoreSection";
import { DetailedScoresSection } from "@/features/resume-analysis/components/DetailedScoresSection";
import { ResumeInsightsSection } from "@/features/resume-analysis/components/ResumeInsightsSection";
import { ResumeRecommendationsSection } from "@/features/resume-analysis/components/ResumeRecommendationsSection";
import { isCompletedAnalysis } from "@/features/resume-analysis/types/resumeAnalysis.types";
import { ROUTES } from "@/routes/routePaths";

export default function ResumeAnalysisPage() {
  const currentResume = useCurrentResume();
  const resumeId = currentResume.data?._id;
  const analysis = useLatestResumeAnalysis(resumeId);

  if (currentResume.isPending) {
    return (
      <PageContainer className="space-y-8">
        <PageHeader title="Resume Analysis" description="AI feedback on your resume." />
        <LoadingSkeleton variant="card" />
      </PageContainer>
    );
  }

  if (currentResume.isEmpty) {
    return (
      <PageContainer className="space-y-8">
        <PageHeader title="Resume Analysis" description="AI feedback on your resume." />
        <EmptyState
          icon={FileText}
          title="No resume yet"
          description="Upload a resume before requesting analysis."
          action={
            <Button asChild size="sm">
              <Link to={ROUTES.RESUME}>Upload Resume</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (currentResume.isError) {
    return (
      <PageContainer className="space-y-8">
        <PageHeader title="Resume Analysis" description="AI feedback on your resume." />
        <ErrorState description="Couldn't load your current resume." onRetry={() => currentResume.refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader
        title="Resume Analysis"
        description="AI feedback on your resume."
        actions={<AnalyzeResumeButton resumeId={resumeId as string} hasExistingAnalysis={Boolean(analysis.data)} />}
      />

      <div aria-live="polite" aria-busy={analysis.isPending} className="space-y-8">
        {analysis.isPending ? (
          <div aria-hidden="true">
            <LoadingSkeleton variant="card" />
          </div>
        ) : analysis.isEmpty ? (
          <EmptyState
            icon={Sparkles}
            title="No analysis yet"
            description="Analyze your resume to receive AI feedback."
          />
        ) : analysis.isError ? (
          <ErrorState description="Couldn't load your resume analysis." onRetry={() => analysis.refetch()} />
        ) : analysis.data ? (
          <>
            <Section title="Status">
              <ResumeAnalysisHeader analysis={analysis.data} />
            </Section>

            {isCompletedAnalysis(analysis.data.analysisStatus) && (
              <>
                <Section title="Score">
                  <ResumeScoreSection analysis={analysis.data} />
                </Section>
                {analysis.data.detailedScores && (
                  <Section title="Detailed Scores">
                    <DetailedScoresSection detailedScores={analysis.data.detailedScores} />
                  </Section>
                )}
                <Section title="Insights">
                  <ResumeInsightsSection analysis={analysis.data} />
                </Section>
                <Section title="Recommendations">
                  <ResumeRecommendationsSection analysis={analysis.data} />
                </Section>
              </>
            )}

            {analysis.data.analysisStatus === "FAILED" && (
              <ErrorState
                title="Analysis failed"
                description={analysis.data.errorMessage ?? "The AI analysis could not be completed."}
              />
            )}

            {(analysis.data.analysisStatus === "PENDING" || analysis.data.analysisStatus === "ANALYZING") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner size="sm" />
                <span>Analysis in progress…</span>
              </div>
            )}
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}
