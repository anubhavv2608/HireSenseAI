import { useState } from "react";
import { JobInput } from "@/features/job-input/components/JobInput";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAnalyzeJob } from "../hooks/useAnalyzeJob";
import { AnalyzeJobButton } from "./AnalyzeJobButton";
import { JOB_DESCRIPTION_MAX_LENGTH } from "../types/jobAnalysis.types";

interface JobDescriptionFormProps {
  resumeId: string;
}

export function JobDescriptionForm({ resumeId }: JobDescriptionFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const mutation = useAnalyzeJob();

  const tooLong = jobDescription.length > JOB_DESCRIPTION_MAX_LENGTH;
  const canSubmit = jobDescription.trim().length > 0 && !tooLong;

  function handleSubmit() {
    setInlineError(null);
    mutation.mutate(
      { resumeId, jobDescription },
      {
        onSuccess: () => toastSuccess("Job description analysis complete"),
        onError: (error) => {
          if (isApiError(error)) {
            if (error.isNetworkError) {
              toastError("Couldn't reach the server", "Check your connection and try again.");
              return;
            }
            if (error.status === 422) {
              setInlineError(error.fieldErrors?.[0]?.message ?? error.message);
              return;
            }
            if (error.status === 400) {
              setInlineError("Your resume is still being processed. Try again once processing finishes.");
              return;
            }
            if (error.status === 409) {
              setInlineError("This resume and job description are already being analyzed.");
              return;
            }
            toastError("Analysis failed", error.message);
            return;
          }
          toastError("Analysis failed");
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <JobInput
        value={jobDescription}
        onChange={setJobDescription}
        maxLength={JOB_DESCRIPTION_MAX_LENGTH}
        disabled={mutation.isPending}
        error={inlineError}
      />
      <div className="flex justify-end">
        <AnalyzeJobButton isPending={mutation.isPending} disabled={!canSubmit} onClick={handleSubmit} />
      </div>
    </div>
  );
}
