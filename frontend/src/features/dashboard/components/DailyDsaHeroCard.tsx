import { Link } from "react-router-dom";
import { ExternalLink, Flame, Mail } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toastError, toastSuccess } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAuth } from "@/hooks/useAuth";
import { DifficultyBadge } from "@/features/daily-dsa/components/DifficultyBadge";
import { CompletionButton } from "@/features/daily-dsa/components/CompletionButton";
import { useTodayAssignment } from "@/features/daily-dsa/hooks/useTodayAssignment";
import { useDailyDsaStatistics } from "@/features/daily-dsa/hooks/useDailyDsaStatistics";
import { useEnableDailyDsa } from "@/features/daily-dsa/hooks/useEnableDailyDsa";
import { ROUTES } from "@/routes/routePaths";

function EmailFooter() {
  return (
    <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
      Problems are also delivered to your inbox —{" "}
      <Link to={ROUTES.DAILY_DSA} className="text-primary hover:underline">
        manage email delivery
      </Link>
    </p>
  );
}

export function DailyDsaHeroCard() {
  const { user } = useAuth();
  const dailyDsaEnabled = Boolean(user?.dailyDsaEnabled);
  const enableMutation = useEnableDailyDsa();

  const today = useTodayAssignment(dailyDsaEnabled);
  const statistics = useDailyDsaStatistics(dailyDsaEnabled);

  if (!dailyDsaEnabled) {
    function handleEnable() {
      enableMutation.mutate(undefined, {
        onSuccess: () => toastSuccess("Daily DSA enabled", "Your first challenge is ready."),
        onError: (error) =>
          toastError("Couldn't enable Daily DSA", isApiError(error) ? error.message : undefined),
      });
    }

    return (
      <ContentCard>
        <div className="flex flex-col items-center gap-4 py-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Flame className="size-8 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Daily DSA</p>
              <p className="text-sm text-muted-foreground">
                Get a new coding problem every day and build a solving streak.
              </p>
            </div>
          </div>
          <Button onClick={handleEnable} disabled={enableMutation.isPending}>
            {enableMutation.isPending ? "Enabling..." : "Enable Daily DSA"}
          </Button>
        </div>
      </ContentCard>
    );
  }

  const todayNotFound = today.isError && isApiError(today.error) && today.error.status === 404;
  const streak = statistics.data?.currentStreak ?? 0;

  return (
    <ContentCard>
      {today.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : todayNotFound ? (
        <div className="flex items-center gap-3 py-2">
          <Flame className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Daily DSA</p>
            <p className="text-sm text-muted-foreground">No problem published yet today. Check back soon.</p>
          </div>
        </div>
      ) : today.isError ? (
        <p className="py-2 text-sm text-muted-foreground">Couldn't load today's Daily DSA problem.</p>
      ) : today.data ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-sm font-semibold text-foreground">
              <Flame className="size-4 text-warning" aria-hidden="true" />
              {streak}d
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{today.data.assignment.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <DifficultyBadge difficulty={today.data.assignment.difficulty} />
                <Badge variant="outline">{today.data.assignment.topic}</Badge>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <a
                href={today.data.assignment.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Solve on LeetCode"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <CompletionButton
              assignmentId={today.data.assignment._id}
              completed={today.data.completed}
              completedAt={today.data.completedAt}
            />
          </div>
        </div>
      ) : null}
      <EmailFooter />
    </ContentCard>
  );
}
