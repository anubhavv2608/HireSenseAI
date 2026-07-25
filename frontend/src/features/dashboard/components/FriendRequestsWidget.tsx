import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useFriendRequests } from "@/features/friends/hooks/useFriendsList";
import { useAcceptFriendRequest, useRejectFriendRequest } from "@/features/friends/hooks/useFriendActions";
import { publicProfilePath, ROUTES } from "@/routes/routePaths";

const PREVIEW_LIMIT = 5;

export function FriendRequestsWidget() {
  const query = useFriendRequests("incoming", 1);
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const requests = (query.data?.data ?? []).slice(0, PREVIEW_LIMIT);

  return (
    <ContentCard title="Friend Requests" description={requests.length > 0 ? `${requests.length} pending` : undefined}>
      {query.isPending ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : requests.length === 0 ? (
        <EmptyState title="No pending requests" className="border-none p-0 py-4" />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Link
                to={publicProfilePath(request.userId, request.username)}
                className="flex min-w-0 items-center gap-2"
              >
                <UserAvatar email={request.userId} name={request.name} imageUrl={request.profilePicture?.url} size="sm" />
                <p className="truncate text-sm font-medium text-foreground">{request.name}</p>
              </Link>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  size="sm"
                  disabled={acceptMutation.isPending}
                  onClick={() =>
                    acceptMutation.mutate(
                      { requestId: request.id, targetUserId: request.userId },
                      {
                        onSuccess: () => toastSuccess("Friend request accepted"),
                        onError: (error) =>
                          toastError("Couldn't accept request", isApiError(error) ? error.message : undefined),
                      },
                    )
                  }
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate(
                      { requestId: request.id, targetUserId: request.userId },
                      {
                        onError: (error) =>
                          toastError("Couldn't reject request", isApiError(error) ? error.message : undefined),
                      },
                    )
                  }
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to={`${ROUTES.FRIENDS}?tab=incoming`} className="mt-3 block text-center text-sm text-primary hover:underline">
        View all friends
      </Link>
    </ContentCard>
  );
}
