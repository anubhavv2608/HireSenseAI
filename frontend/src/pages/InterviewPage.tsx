import { FileText, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { AnalysisResultGate } from "@/components/common/analysis/AnalysisResultGate";
import { useCurrentResume } from "@/features/resume/hooks/useCurrentResume";
import { useLatestInterview } from "@/features/interview/hooks/useLatestInterview";
import { useGenerateInterview } from "@/features/interview/hooks/useGenerateInterview";
import { useRegenerateInterview } from "@/features/interview/hooks/useRegenerateInterview";
import { GenerateInterviewButton } from "@/features/interview/components/GenerateInterviewButton";
import { InterviewLayout } from "@/features/interview/components/InterviewLayout";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { ROUTES } from "@/routes/routePaths";

export default function InterviewPage() {
  const currentResume = useCurrentResume();
  const interview = useLatestInterview(currentResume.data?._id);
  const generateMutation = useGenerateInterview();
  const regenerateMutation = useRegenerateInterview();

  function handleGenerate(resumeId: string, hasExisting: boolean) {
    const mutation = hasExisting ? regenerateMutation : generateMutation;
    mutation.mutate(resumeId, {
      onSuccess: () => toastSuccess("Interview questions generated"),
      onError: (error) => {
        if (isApiError(error)) {
          if (error.isNetworkError) {
            toastError("Couldn't reach the server", "Check your connection and try again.");
            return;
          }
          if (error.status === 400) {
            toastError("Resume not ready", "Your resume is still being processed. Try again once processing finishes.");
            return;
          }
          if (error.status === 409) {
            toastError("Already generating", "Interview questions are already being generated for this resume.");
            return;
          }
          toastError("Generation failed", error.message);
          return;
        }
        toastError("Generation failed");
      },
    });
  }

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Interview" description="Generate practice interview questions based on your resume." />

      <AnalysisResultGate
        isPending={currentResume.isPending}
        isEmpty={currentResume.isEmpty}
        isError={currentResume.isError}
        data={currentResume.data}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No resume yet"
            description="Upload a resume before generating interview questions."
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
            <GenerateInterviewButton
              isPending={generateMutation.isPending || regenerateMutation.isPending}
              hasExisting={Boolean(interview.data)}
              onClick={() => handleGenerate(resume._id, Boolean(interview.data))}
            />

            <AnalysisResultGate
              ariaLive
              className="space-y-8"
              isPending={interview.isPending}
              isEmpty={interview.isEmpty}
              isError={interview.isError}
              data={interview.data}
              emptyState={
                <EmptyState
                  icon={MessagesSquare}
                  title="No interview generated yet"
                  description="Click Generate Interview above to create practice questions."
                />
              }
              errorDescription="Couldn't load your interview questions."
              onRetry={() => interview.refetch()}
            >
              {(generation) => <InterviewLayout generation={generation} />}
            </AnalysisResultGate>
          </div>
        )}
      </AnalysisResultGate>
    </PageContainer>
  );
}
