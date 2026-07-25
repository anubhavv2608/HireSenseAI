import { useState } from "react";
import { JobSourceSelector } from "./JobSourceSelector";
import { JobTextInput } from "./JobTextInput";
import { JobFileUpload, type JobFileUploadStatus } from "./JobFileUpload";
import { JobPreview } from "./JobPreview";
import { useExtractJobFile } from "../hooks/useExtractJobFile";
import type { JobSource } from "../types/jobInput.types";

interface JobInputProps {
  value: string;
  onChange: (text: string) => void;
  maxLength: number;
  disabled?: boolean;
  error?: string | null;
}

const ERROR_ID = "job-description-error";

export function JobInput({ value, onChange, maxLength, disabled, error }: JobInputProps) {
  const [source, setSource] = useState<JobSource>("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const extraction = useExtractJobFile();

  function handleFileSelected(file: File) {
    setSelectedFile(file);
    extraction.mutate(file);
  }

  function handleRemove() {
    setSelectedFile(null);
    extraction.reset();
  }

  function handleUseText() {
    if (extraction.data) {
      onChange(extraction.data.extractedText);
    }
  }

  function handleDiscard() {
    setSelectedFile(null);
    extraction.reset();
  }

  const uploadStatus: JobFileUploadStatus = !selectedFile
    ? "idle"
    : extraction.isPending
      ? extraction.progress < 100
        ? "uploading"
        : "extracting"
      : extraction.isError
        ? "error"
        : extraction.isSuccess
          ? "success"
          : "idle";

  const extractionError = extraction.isError
    ? extraction.error instanceof Error
      ? extraction.error.message
      : "Extraction failed."
    : null;

  return (
    <div className="space-y-4">
      <JobSourceSelector value={source} onChange={setSource} disabled={disabled} />

      {source === "text" && (
        <JobTextInput value={value} onChange={onChange} maxLength={maxLength} disabled={disabled} />
      )}

      {source === "pdf" && (
        <div className="space-y-4">
          <JobFileUpload
            status={uploadStatus}
            progress={extraction.progress}
            file={selectedFile}
            disabled={disabled}
            onFileSelected={handleFileSelected}
            onRemove={handleRemove}
            serverError={extractionError}
          />
          {extraction.data && (
            <JobPreview
              extractedText={extraction.data.extractedText}
              metadata={extraction.data.metadata}
              onUseText={handleUseText}
              onDiscard={handleDiscard}
            />
          )}
        </div>
      )}

      {error && (
        <p id={ERROR_ID} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
