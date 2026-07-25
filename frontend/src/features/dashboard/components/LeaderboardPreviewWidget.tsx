import { Link } from "react-router-dom";
import { ContentCard } from "@/components/common/ContentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/features/leaderboard/hooks/useLeaderboard";
import { LeaderboardTable } from "@/features/leaderboard/components/LeaderboardTable";
import { ROUTES } from "@/routes/routePaths";

const PREVIEW_LIMIT = 5;

export function LeaderboardPreviewWidget() {
  const { user } = useAuth();
  const query = useLeaderboard({ scope: "overall", page: 1, limit: PREVIEW_LIMIT });

  return (
    <ContentCard
      title="Leaderboard"
      description={query.data ? `You're #${query.data.currentUserPosition.rank} overall` : undefined}
    >
      {query.isPending ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : !query.data || query.data.data.length === 0 ? (
        <EmptyState title="No rankings yet" className="border-none p-0 py-4" />
      ) : (
        <LeaderboardTable rows={query.data.data} currentUserId={user?._id} />
      )}
      <Link to={ROUTES.LEADERBOARD} className="mt-3 block text-center text-sm text-primary hover:underline">
        View full leaderboard
      </Link>
    </ContentCard>
  );
}
