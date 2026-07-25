import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useCompleteAssignment } from "../hooks/useCompleteAssignment";
import { formatCompletedAt } from "../utils/formatDate";

interface CompletionButtonProps {
  assignmentId: string;
  completed: boolean;
  completedAt?: string;
}

export function CompletionButton({ assignmentId, completed, completedAt }: CompletionButtonProps) {
  const completeMutation = useCompleteAssignment();

  function handleComplete() {
    completeMutation.mutate(assignmentId, {
      onSuccess: (result) => {
        if (result.alreadyCompleted) {
          toastSuccess("Already completed", "You've already marked this assignment as complete.");
        } else {
          toastSuccess("Assignment completed", "Great work — your streak has been updated.");
        }
      },
      onError: (error) => {
        if (isApiError(error) && error.isNetworkError) {
          toastError("Network error", "Check your connection and try again.");
          return;
        }
        toastError("Couldn't mark as completed", isApiError(error) ? error.message : "Server error");
      },
    });
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-success">
        <Check className="size-4" aria-hidden="true" />
        <span>Completed{completedAt && ` · ${formatCompletedAt(completedAt)}`}</span>
      </div>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={completeMutation.isPending} aria-label="Mark assignment as completed">
      {completeMutation.isPending ? "Marking..." : "Mark as Completed"}
    </Button>
  );
}
