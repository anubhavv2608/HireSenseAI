import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { publicProfilePath } from "@/routes/routePaths";
import { ChallengeActionButton } from "@/features/challenges/components/ChallengeActionButton";
import { useFriendRequests, useFriends } from "../hooks/useFriendsList";
import { useAcceptFriendRequest, useCancelFriendRequest, useRejectFriendRequest, useRemoveFriend } from "../hooks/useFriendActions";
import type { FriendRequestListType } from "../types/friends.types";

const TABS = ["friends", "incoming", "outgoing"] as const;
type Tab = (typeof TABS)[number];

function isTab(value: string | null): value is Tab {
  return !!value && (TABS as readonly string[]).includes(value);
}

export default function FriendsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = isTab(searchParams.get("tab")) ? (searchParams.get("tab") as Tab) : "friends";

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Friends" description="Manage your connections on HireSense AI." />

      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="pt-4">
          <FriendsListTab />
        </TabsContent>
        <TabsContent value="incoming" className="pt-4">
          <RequestsListTab type="incoming" />
        </TabsContent>
        <TabsContent value="outgoing" className="pt-4">
          <RequestsListTab type="outgoing" />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function FriendsListTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useFriends({ search: search || undefined, page, limit: 12 });
  const removeMutation = useRemoveFriend();

  return (
    <div className="space-y-4">
      <SearchInput
        placeholder="Search friends…"
        onValueChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      {query.isPending ? (
        <LoadingSkeleton variant="list" count={5} />
      ) : query.isError ? (
        <ErrorState description="Couldn't load friends." onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState title="No friends yet" description="Search for students to connect with." />
      ) : (
        <>
          <div className="divide-y divide-border rounded-lg border border-border">
            {query.data.data.map((friend) => (
              <div key={friend.userId} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={publicProfilePath(friend.userId, friend.username)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <UserAvatar email={friend.userId} name={friend.name} imageUrl={friend.profilePicture?.url} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{friend.name}</p>
                    {friend.username && <p className="truncate text-sm text-muted-foreground">@{friend.username}</p>}
                  </div>
                </Link>
                <div className="flex shrink-0 gap-2">
                  <ChallengeActionButton targetUserId={friend.userId} targetName={friend.name} />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removeMutation.isPending}
                    onClick={() =>
                      removeMutation.mutate(friend.userId, {
                        onSuccess: () => toastSuccess("Friend removed"),
                        onError: (error) =>
                          toastError("Couldn't remove friend", isApiError(error) ? error.message : undefined),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination meta={query.data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function RequestsListTab({ type }: { type: FriendRequestListType }) {
  const [page, setPage] = useState(1);
  const query = useFriendRequests(type, page);
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const cancelMutation = useCancelFriendRequest();

  if (query.isPending) return <LoadingSkeleton variant="list" count={5} />;
  if (query.isError) return <ErrorState description="Couldn't load requests." onRetry={() => query.refetch()} />;
  if (query.data.data.length === 0) {
    return (
      <EmptyState
        title={type === "incoming" ? "No incoming requests" : "No outgoing requests"}
        description={
          type === "incoming"
            ? "Friend requests sent to you will show up here."
            : "Requests you've sent will show up here."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-border rounded-lg border border-border">
        {query.data.data.map((request) => (
          <div key={request.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to={publicProfilePath(request.userId, request.username)} className="flex min-w-0 items-center gap-3">
              <UserAvatar email={request.userId} name={request.name} imageUrl={request.profilePicture?.url} />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{request.name}</p>
                {request.username && <p className="truncate text-sm text-muted-foreground">@{request.username}</p>}
              </div>
            </Link>
            {type === "incoming" ? (
              <div className="flex gap-2">
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
                  variant="outline"
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
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={cancelMutation.isPending}
                onClick={() =>
                  cancelMutation.mutate(
                    { requestId: request.id, targetUserId: request.userId },
                    {
                      onError: (error) =>
                        toastError("Couldn't cancel request", isApiError(error) ? error.message : undefined),
                    },
                  )
                }
              >
                Cancel
              </Button>
            )}
          </div>
        ))}
      </div>
      <Pagination meta={query.data.meta} onPageChange={setPage} />
    </div>
  );
}
