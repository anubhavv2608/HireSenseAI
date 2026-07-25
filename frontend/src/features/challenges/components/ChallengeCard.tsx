import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { publicProfilePath } from "@/routes/routePaths";
import { useAcceptChallenge, useCancelChallenge, useCompleteChallenge, useDeclineChallenge } from "../hooks/useChallengeActions";
import type { Challenge, ChallengeStatus } from "../types/challenges.types";

const STATUS_TONE: Record<ChallengeStatus, StatusTone> = {
  pending: "warning",
  accepted: "info",
  declined: "neutral",
  cancelled: "neutral",
  completed: "success",
};

const STATUS_LABEL: Record<ChallengeStatus, string> = {
  pending: "Pending",
  accepted: "In progress",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

interface ChallengeCardProps {
  challenge: Challenge;
  viewerUserId: string;
}

export function ChallengeCard({ challenge, viewerUserId }: ChallengeCardProps) {
  const isChallenger = challenge.challenger.userId === viewerUserId;
  const opponent = isChallenger ? challenge.opponent : challenge.challenger;
  const myCompletedAt = isChallenger ? challenge.challengerCompletedAt : challenge.opponentCompletedAt;

  const acceptMutation = useAcceptChallenge();
  const declineMutation = useDeclineChallenge();
  const cancelMutation = useCancelChallenge();
  const completeMutation = useCompleteChallenge();

  function onError(message: string) {
    return (error: unknown) => toastError(message, isApiError(error) ? error.message : undefined);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{challenge.problem.title}</p>
          <p className="text-sm text-muted-foreground">
            {isChallenger ? "You challenged " : "Challenged by "}
            <Link to={publicProfilePath(opponent.userId, opponent.username)} className="hover:underline">
              {opponent.username ? `@${opponent.username}` : opponent.name}
            </Link>
            {challenge.problem.difficulty && ` · ${challenge.problem.difficulty}`}
          </p>
        </div>
        <StatusBadge tone={STATUS_TONE[challenge.status]}>{STATUS_LABEL[challenge.status]}</StatusBadge>
      </div>

      {challenge.problem.url && (
        <a
          href={challenge.problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-primary hover:underline"
        >
          View problem ↗
        </a>
      )}
      {challenge.problem.notes && <p className="text-sm text-muted-foreground">{challenge.problem.notes}</p>}

      {challenge.status === "completed" && (
        <p className="text-sm font-medium text-success">
          {challenge.winnerId === viewerUserId ? "You won! 🎉" : challenge.winnerId ? "Your opponent won" : "Completed"}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        {challenge.status === "pending" && !isChallenger && (
          <>
            <Button
              size="sm"
              disabled={acceptMutation.isPending}
              onClick={() =>
                acceptMutation.mutate(challenge.id, {
                  onSuccess: () => toastSuccess("Challenge accepted"),
                  onError: onError("Couldn't accept challenge"),
                })
              }
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={declineMutation.isPending}
              onClick={() => declineMutation.mutate(challenge.id, { onError: onError("Couldn't decline challenge") })}
            >
              Decline
            </Button>
          </>
        )}

        {challenge.status === "pending" && isChallenger && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(challenge.id, { onError: onError("Couldn't cancel challenge") })}
          >
            Cancel
          </Button>
        )}

        {challenge.status === "accepted" &&
          (myCompletedAt ? (
            <p className="text-sm text-muted-foreground">Waiting for your opponent…</p>
          ) : (
            <Button
              size="sm"
              disabled={completeMutation.isPending}
              onClick={() =>
                completeMutation.mutate(challenge.id, {
                  onSuccess: () => toastSuccess("Marked as complete"),
                  onError: onError("Couldn't mark complete"),
                })
              }
            >
              Mark Complete
            </Button>
          ))}
      </div>
    </div>
  );
}
