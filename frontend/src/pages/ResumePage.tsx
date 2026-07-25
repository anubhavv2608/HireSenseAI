import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useCurrentResume } from "@/features/resume/hooks/useCurrentResume";
import { useResumeHistory } from "@/features/resume/hooks/useResumeHistory";
import { ResumeUploader } from "@/features/resume/components/ResumeUploader";
import { ResumeCard } from "@/features/resume/components/ResumeCard";
import { ProcessingStatusCard } from "@/features/resume/components/ProcessingStatusCard";
import { ResumeHistoryTable } from "@/features/resume/components/ResumeHistoryTable";
import { EmptyResumeState } from "@/features/resume/components/EmptyResumeState";
import { ResumeInsightsSummaryCard } from "@/features/resume/components/ResumeInsightsSummaryCard";
import { RESUME_UPLOADER_ANCHOR_ID } from "@/features/resume/components/ResumeActions";

export default function ResumePage() {
  const currentResume = useCurrentResume();
  const history = useResumeHistory();

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Resume" description="Upload, manage, and track your resume." />

      <Section title="Upload">
        <div id={RESUME_UPLOADER_ANCHOR_ID}>
          <ResumeUploader hasCurrentResume={Boolean(currentResume.data)} />
        </div>
      </Section>

      <Section title="Current Resume">
        {currentResume.isPending ? (
          <LoadingSkeleton variant="card" />
        ) : currentResume.isEmpty ? (
          <EmptyResumeState />
        ) : currentResume.isError ? (
          <ErrorState description="Couldn't load your current resume." onRetry={() => currentResume.refetch()} />
        ) : currentResume.data ? (
          <ResumeCard resume={currentResume.data} title="Current Resume" />
        ) : null}
      </Section>

      {currentResume.data && (
        <Section title="Processing">
          <ProcessingStatusCard resumeId={currentResume.data._id} />
        </Section>
      )}

      {currentResume.data && <ResumeInsightsSummaryCard resumeId={currentResume.data._id} />}

      <Section title="History">
        {history.isPending ? (
          <LoadingSkeleton variant="list" />
        ) : history.isError ? (
          <ErrorState description="Couldn't load resume history." onRetry={() => history.refetch()} />
        ) : history.data && history.data.length > 0 ? (
          <ResumeHistoryTable resumes={history.data} />
        ) : (
          <EmptyResumeState description="Your resume history will appear here." />
        )}
      </Section>
    </PageContainer>
  );
}
