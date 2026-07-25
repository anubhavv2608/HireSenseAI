import { UserPlus, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { useFriendStatus } from "../hooks/useFriendStatus";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from "../hooks/useFriendActions";

interface FriendActionButtonProps {
  targetUserId: string;
  size?: "sm" | "default";
}

/** Stops the click from bubbling to an ancestor <Link> (e.g. a StudentCard). */
function stop(event: React.MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function handleError(error: unknown, message: string) {
  toastError(message, isApiError(error) ? error.message : undefined);
}

export function FriendActionButton({ targetUserId, size = "sm" }: FriendActionButtonProps) {
  const { user } = useAuth();
  const statusQuery = useFriendStatus(targetUserId);
  const sendMutation = useSendFriendRequest();
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const cancelMutation = useCancelFriendRequest();
  const removeMutation = useRemoveFriend();

  if (!user || user._id === targetUserId) {
    return null;
  }

  if (statusQuery.isPending) {
    return (
      <Button size={size} variant="outline" disabled>
        <Clock className="size-4" /> ...
      </Button>
    );
  }

  const { status, requestId } = statusQuery.data ?? { status: "none", requestId: null };

  if (status === "none") {
    return (
      <Button
        size={size}
        variant="outline"
        disabled={sendMutation.isPending}
        onClick={(event) => {
          stop(event);
          sendMutation.mutate(targetUserId, {
            onError: (error) => handleError(error, "Couldn't send friend request"),
          });
        }}
      >
        <UserPlus className="size-4" /> Add Friend
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button
        size={size}
        variant="outline"
        disabled={cancelMutation.isPending || !requestId}
        onClick={(event) => {
          stop(event);
          if (!requestId) return;
          cancelMutation.mutate(
            { requestId, targetUserId },
            { onError: (error) => handleError(error, "Couldn't cancel request") },
          );
        }}
      >
        <Clock className="size-4" /> Request Sent
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex gap-2">
        <Button
          size={size}
          disabled={acceptMutation.isPending || !requestId}
          onClick={(event) => {
            stop(event);
            if (!requestId) return;
            acceptMutation.mutate(
              { requestId, targetUserId },
              {
                onSuccess: () => toastSuccess("Friend request accepted"),
                onError: (error) => handleError(error, "Couldn't accept request"),
              },
            );
          }}
        >
          Accept
        </Button>
        <Button
          size={size}
          variant="outline"
          disabled={rejectMutation.isPending || !requestId}
          onClick={(event) => {
            stop(event);
            if (!requestId) return;
            rejectMutation.mutate(
              { requestId, targetUserId },
              { onError: (error) => handleError(error, "Couldn't reject request") },
            );
          }}
        >
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      disabled={removeMutation.isPending}
      onClick={(event) => {
        stop(event);
        removeMutation.mutate(targetUserId, {
          onError: (error) => handleError(error, "Couldn't remove friend"),
        });
      }}
    >
      <UserCheck className="size-4" /> Friends
    </Button>
  );
}
