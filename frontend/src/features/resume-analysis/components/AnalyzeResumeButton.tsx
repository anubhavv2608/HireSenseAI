import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/Spinner";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAnalyzeResume } from "../hooks/useAnalyzeResume";

interface AnalyzeResumeButtonProps {
  resumeId: string;
  hasExistingAnalysis: boolean;
}

export function AnalyzeResumeButton({ resumeId, hasExistingAnalysis }: AnalyzeResumeButtonProps) {
  const [inlineError, setInlineError] = useState<string | null>(null);
  const mutation = useAnalyzeResume();

  function handleClick() {
    setInlineError(null);
    mutation.mutate(resumeId, {
      onSuccess: () => toastSuccess("Resume analysis complete"),
      onError: (error) => {
        if (isApiError(error)) {
          if (error.isNetworkError) {
            toastError("Couldn't reach the server", "Check your connection and try again.");
            return;
          }
          if (error.status === 400) {
            setInlineError("Your resume is still being processed. Try again once processing finishes.");
            return;
          }
          if (error.status === 409) {
            setInlineError("Your resume is already being processed. Try again in a moment.");
            return;
          }
          toastError("Analysis failed", error.message);
          return;
        }
        toastError("Analysis failed");
      },
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <Button onClick={handleClick} disabled={mutation.isPending} aria-busy={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Spinner size="sm" />
            Analyzing...
          </>
        ) : hasExistingAnalysis ? (
          "Re-analyze Resume"
        ) : (
          "Analyze Resume"
        )}
      </Button>
      {inlineError && (
        <p role="alert" className="text-sm text-destructive">
          {inlineError}
        </p>
      )}
    </div>
  );
}
