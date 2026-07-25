import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flame, Trophy, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { StatTile } from "@/components/common/StatTile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { LeaderboardTable } from "../components/LeaderboardTable";
import type { LeaderboardScope } from "../types/leaderboard.types";

const SCOPES = ["daily", "weekly", "monthly", "overall"] as const satisfies readonly LeaderboardScope[];
type Scope = (typeof SCOPES)[number];

function isScope(value: string | null): value is Scope {
  return !!value && (SCOPES as readonly string[]).includes(value);
}

const PAGE_SIZE = 15;

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const scope = isScope(searchParams.get("scope")) ? (searchParams.get("scope") as Scope) : "overall";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = useLeaderboard({ scope, search: search || undefined, page, limit: PAGE_SIZE });

  function handleScopeChange(value: string) {
    setSearchParams({ scope: value }, { replace: true });
    setPage(1);
  }

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <PageHeader title="Leaderboard" description="See how you stack up against other students on Daily DSA." />

      <Tabs value={scope} onValueChange={handleScopeChange}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="overall">Overall</TabsTrigger>
        </TabsList>

        {SCOPES.map((scopeValue) => (
          <TabsContent key={scopeValue} value={scopeValue} className="space-y-4 pt-4">
            {query.data && (
              <div className="grid gap-4 sm:grid-cols-3">
                <StatTile icon={Trophy} value={`#${query.data.currentUserPosition.rank}`} label="Rank" />
                <StatTile icon={CheckCircle2} value={query.data.currentUserPosition.totalCompleted} label="Solved" />
                <StatTile icon={Flame} value={`${query.data.currentUserPosition.currentStreak}d`} label="Day streak" />
              </div>
            )}

            <SearchInput
              placeholder="Search students…"
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />

            {query.isPending ? (
              <LoadingSkeleton variant="list" count={6} />
            ) : query.isError ? (
              <ErrorState description="Couldn't load the leaderboard." onRetry={() => query.refetch()} />
            ) : query.data.data.length === 0 ? (
              <EmptyState
                title="No rankings yet"
                description="Complete Daily DSA problems to appear on the leaderboard."
              />
            ) : (
              <>
                <LeaderboardTable rows={query.data.data} currentUserId={user?._id} />
                <Pagination meta={query.data.meta} onPageChange={setPage} />
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}
