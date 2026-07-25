import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";
import { validateResumeFile } from "../utils/fileValidation";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadDropzoneProps {
  status: UploadStatus;
  progress: number;
  disabled?: boolean;
  mode: "upload" | "replace";
  onFileSelected: (file: File) => void;
  serverError?: string | null;
}

export function UploadDropzone({
  status,
  progress,
  disabled = false,
  mode,
  onFileSelected,
  serverError,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorId = useId();

  const isUploading = status === "uploading";
  const isDisabled = disabled || isUploading;

  function handleFile(file: File) {
    const result = validateResumeFile(file);
    if (!result.valid) {
      setValidationError(result.reason);
      return;
    }
    setValidationError(null);
    onFileSelected(file);
  }

  function openFilePicker() {
    if (isDisabled) return;
    inputRef.current?.click();
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isDisabled) return;
    dragCounter.current += 1;
    setIsDraggingOver(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDraggingOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragCounter.current = 0;
    setIsDraggingOver(false);
    if (isDisabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const displayError = validationError ?? serverError ?? null;

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        aria-label={
          mode === "replace"
            ? "Replace resume, drag and drop a PDF or press Enter to browse"
            : "Upload resume, drag and drop a PDF or press Enter to browse"
        }
        aria-describedby={displayError ? errorId : undefined}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDraggingOver && !isDisabled ? "border-primary bg-primary/5" : "border-border",
          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/60 hover:bg-muted/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          tabIndex={-1}
          disabled={isDisabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />

        {isUploading ? (
          <>
            <Spinner size="lg" />
            <p className="text-sm font-medium text-foreground">Uploading...</p>
            <Progress value={progress} className="w-full max-w-xs" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              {mode === "replace" ? "Drop a new PDF to replace your resume" : "Drop your resume here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">PDF only, up to 5MB</p>
          </>
        )}
      </div>
      {status === "success" && (
        <p className="text-sm text-success" role="status">
          Upload successful.
        </p>
      )}
      {displayError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {displayError}
        </p>
      )}
    </div>
  );
}
