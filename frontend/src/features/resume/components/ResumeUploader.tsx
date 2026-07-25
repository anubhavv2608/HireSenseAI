import { useUploadResume } from "../hooks/useUploadResume";
import { useReplaceResume } from "../hooks/useReplaceResume";
import { UploadDropzone, type UploadStatus } from "./UploadDropzone";
import { isApiError } from "@/api/apiError";
import { toastSuccess, toastError } from "@/components/common/Toast";

interface ResumeUploaderProps {
  hasCurrentResume: boolean;
}

export function ResumeUploader({ hasCurrentResume }: ResumeUploaderProps) {
  const uploadMutation = useUploadResume();
  const replaceMutation = useReplaceResume();
  const mode = hasCurrentResume ? "replace" : "upload";
  const mutation = mode === "replace" ? replaceMutation : uploadMutation;

  const status: UploadStatus = mutation.isPending
    ? "uploading"
    : mutation.isSuccess
      ? "success"
      : mutation.isError
        ? "error"
        : "idle";

  function handleFileSelected(file: File) {
    mutation.mutate(file, {
      onSuccess: () => {
        toastSuccess(
          mode === "replace" ? "Resume replaced" : "Resume uploaded",
          "Processing has started automatically.",
        );
      },
      onError: (error) => {
        toastError("Upload failed", isApiError(error) ? error.message : "Something went wrong.");
      },
    });
  }

  return (
    <UploadDropzone
      status={status}
      progress={mutation.progress}
      disabled={uploadMutation.isPending || replaceMutation.isPending}
      mode={mode}
      onFileSelected={handleFileSelected}
      serverError={mutation.isError && isApiError(mutation.error) ? mutation.error.message : null}
    />
  );
}
