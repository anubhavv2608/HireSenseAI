import { FileText, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { AnalysisResultGate } from "@/components/common/analysis/AnalysisResultGate";
import { useCurrentResume } from "@/features/resume/hooks/useCurrentResume";
import { useLatestJobAnalysis } from "@/features/job-analysis/hooks/useLatestJobAnalysis";
import { JobDescriptionForm } from "@/features/job-analysis/components/JobDescriptionForm";
import { JobAnalysisLayout } from "@/features/job-analysis/components/JobAnalysisLayout";
import { ROUTES } from "@/routes/routePaths";

export default function JobAnalysisPage() {
  const currentResume = useCurrentResume();
  const jobAnalysis = useLatestJobAnalysis(currentResume.data?._id);

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Job Match" description="Compare your resume against a job description." />

      <AnalysisResultGate
        isPending={currentResume.isPending}
        isEmpty={currentResume.isEmpty}
        isError={currentResume.isError}
        data={currentResume.data}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No resume yet"
            description="Upload a resume before requesting a job match."
            action={
              <Button asChild size="sm">
                <Link to={ROUTES.RESUME}>Upload Resume</Link>
              </Button>
            }
          />
        }
        errorDescription="Couldn't load your current resume."
        onRetry={() => currentResume.refetch()}
      >
        {(resume) => (
          <div className="space-y-8">
            <JobDescriptionForm resumeId={resume._id} />

            <AnalysisResultGate
              ariaLive
              className="space-y-8"
              isPending={jobAnalysis.isPending}
              isEmpty={jobAnalysis.isEmpty}
              isError={jobAnalysis.isError}
              data={jobAnalysis.data}
              emptyState={
                <EmptyState
                  icon={Target}
                  title="No job analysis yet"
                  description="Paste a job description above and click Analyze to see your match."
                />
              }
              errorDescription="Couldn't load your job match analysis."
              onRetry={() => jobAnalysis.refetch()}
            >
              {(analysis) => <JobAnalysisLayout analysis={analysis} />}
            </AnalysisResultGate>
          </div>
        )}
      </AnalysisResultGate>
    </PageContainer>
  );
}
