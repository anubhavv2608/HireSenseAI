import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/common/Spinner";
import { cn } from "@/lib/utils";
import { validateJobFile } from "../utils/validateJobFile";

export type JobFileUploadStatus = "idle" | "uploading" | "extracting" | "success" | "error";

interface JobFileUploadProps {
  status: JobFileUploadStatus;
  progress: number;
  file: File | null;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  serverError?: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function JobFileUpload({
  status,
  progress,
  file,
  disabled = false,
  onFileSelected,
  onRemove,
  serverError,
}: JobFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorId = useId();

  const isBusy = status === "uploading" || status === "extracting";
  const isDisabled = disabled || isBusy;

  function handleFile(selected: File) {
    const result = validateJobFile(selected);
    if (!result.valid) {
      setValidationError(result.reason);
      return;
    }
    setValidationError(null);
    onFileSelected(selected);
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
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }

  function handleRemove() {
    onRemove();
    setValidationError(null);
    requestAnimationFrame(() => dropzoneRef.current?.focus());
  }

  const displayError = validationError ?? serverError ?? null;

  return (
    <div className="space-y-2" aria-live="polite" aria-busy={isBusy}>
      {file && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${file.name}`}
            onClick={handleRemove}
            disabled={isBusy}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      <div
        ref={dropzoneRef}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        aria-label={
          file
            ? "Replace job description PDF, drag and drop a PDF or press Enter to browse"
            : "Upload job description PDF, drag and drop a PDF or press Enter to browse"
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
            const selected = event.target.files?.[0];
            if (selected) handleFile(selected);
            event.target.value = "";
          }}
        />

        {isBusy ? (
          <>
            <Spinner size="lg" />
            <p className="text-sm font-medium text-foreground">
              {status === "uploading" ? "Uploading…" : "Extracting text…"}
            </p>
            {status === "uploading" && (
              <>
                <Progress value={progress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </>
            )}
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              {file ? "Drop a new PDF to replace this one" : "Drop your job description PDF here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">PDF only, up to 5MB</p>
          </>
        )}
      </div>

      {status === "success" && (
        <p className="text-sm text-success" role="status">
          Text extracted successfully.
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
