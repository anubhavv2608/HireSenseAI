import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useSetActiveResume } from "../hooks/useSetActiveResume";
import { useDeleteResume } from "../hooks/useDeleteResume";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import type { Resume } from "../types/resume.types";

export const RESUME_UPLOADER_ANCHOR_ID = "resume-uploader";

interface ResumeActionsProps {
  resume: Resume;
}

export function ResumeActions({ resume }: ResumeActionsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const setActiveMutation = useSetActiveResume();
  const deleteMutation = useDeleteResume();

  function handleMakeActive() {
    setActiveMutation.mutate(resume._id, {
      onSuccess: () => toastSuccess("Active resume updated"),
      onError: (error) => toastError("Couldn't set active resume", isApiError(error) ? error.message : undefined),
    });
  }

  function handleReplace() {
    document.getElementById(RESUME_UPLOADER_ANCHOR_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDelete() {
    deleteMutation.mutate(resume._id, {
      onSuccess: () => {
        toastSuccess("Resume deleted");
        setConfirmDeleteOpen(false);
      },
      onError: (error) => {
        toastError("Couldn't delete resume", isApiError(error) ? error.message : undefined);
      },
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${resume.originalFilename}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {resume.isActive ? (
            <DropdownMenuItem onSelect={handleReplace}>Replace</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={handleMakeActive} disabled={setActiveMutation.isPending}>
              Make Active
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmDeleteOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete resume?"
        description={`This will permanently remove "${resume.originalFilename}" from your history.`}
        confirmLabel="Delete"
        variant="destructive"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
