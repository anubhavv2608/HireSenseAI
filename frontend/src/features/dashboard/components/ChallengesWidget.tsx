import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useChallenges } from "@/features/challenges/hooks/useChallenges";
import { useAcceptChallenge } from "@/features/challenges/hooks/useChallengeActions";
import { ROUTES } from "@/routes/routePaths";

export function ChallengesWidget() {
  const incomingQuery = useChallenges("incoming", 1);
  const activeQuery = useChallenges("active", 1);
  const acceptMutation = useAcceptChallenge();

  const isPending = incomingQuery.isPending || activeQuery.isPending;
  const nextIncoming = incomingQuery.data?.data[0];
  const nextActive = activeQuery.data?.data[0];
  const upcoming = nextIncoming ?? nextActive;

  return (
    <ContentCard title="Upcoming Challenge">
      {isPending ? (
        <LoadingSkeleton variant="card" />
      ) : !upcoming ? (
        <EmptyState
          title="No upcoming challenges"
          description="Challenge a friend to a problem."
          className="border-none p-0 py-4"
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Swords className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{upcoming.problem.title}</p>
              <p className="text-sm text-muted-foreground">
                {nextIncoming ? (
                  <>
                    <strong>
                      {upcoming.challenger.username ? `@${upcoming.challenger.username}` : upcoming.challenger.name}
                    </strong>{" "}
                    challenged you
                  </>
                ) : (
                  "In progress"
                )}
              </p>
            </div>
          </div>
          {nextIncoming ? (
            <Button
              size="sm"
              className="w-full"
              disabled={acceptMutation.isPending}
              onClick={() =>
                acceptMutation.mutate(upcoming.id, {
                  onSuccess: () => toastSuccess("Challenge accepted"),
                  onError: (error) =>
                    toastError("Couldn't accept challenge", isApiError(error) ? error.message : undefined),
                })
              }
            >
              Join Now
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to={ROUTES.CHALLENGES}>Continue</Link>
            </Button>
          )}
        </div>
      )}
      <Link to={ROUTES.CHALLENGES} className="mt-3 block text-center text-sm text-primary hover:underline">
        View all challenges
      </Link>
    </ContentCard>
  );
}
