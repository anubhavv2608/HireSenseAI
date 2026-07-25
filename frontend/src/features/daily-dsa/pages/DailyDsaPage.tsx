import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { ContentCard } from "@/components/common/ContentCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isApiError } from "@/api/apiError";
import { useTodayAssignment } from "../hooks/useTodayAssignment";
import { useDailyDsaStatistics } from "../hooks/useDailyDsaStatistics";
import { useDailyDsaHistory } from "../hooks/useDailyDsaHistory";
import { EnableDailyDsaCard } from "../components/EnableDailyDsaCard";
import { DailyDsaEmailToggle } from "../components/DailyDsaEmailToggle";
import { TodaysAssignmentCard } from "../components/TodaysAssignmentCard";
import { EmptyAssignmentState } from "../components/EmptyAssignmentState";
import { StatisticsGrid } from "../components/StatisticsGrid";
import { HistoryTable } from "../components/HistoryTable";

const HISTORY_PAGE_SIZE = 10;

export default function DailyDsaPage() {
  const { user } = useAuth();
  const dailyDsaEnabled = Boolean(user?.dailyDsaEnabled);
  const [historyPage, setHistoryPage] = useState(1);

  const today = useTodayAssignment(dailyDsaEnabled);
  const statistics = useDailyDsaStatistics(dailyDsaEnabled);
  const history = useDailyDsaHistory({ page: historyPage, limit: HISTORY_PAGE_SIZE }, dailyDsaEnabled);

  const todayNotFound = today.isError && isApiError(today.error) && today.error.status === 404;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Daily DSA" description="Solve today's problem, keep your streak alive." />

      {!dailyDsaEnabled ? (
        <EnableDailyDsaCard />
      ) : (
        <>
          <DailyDsaEmailToggle />

          {today.isPending ? (
            <LoadingSkeleton variant="card" />
          ) : todayNotFound ? (
            <ContentCard title="Today's Challenge">
              <EmptyAssignmentState />
            </ContentCard>
          ) : today.isError ? (
            <ErrorState description="Couldn't load today's assignment." onRetry={() => today.refetch()} />
          ) : today.data ? (
            <TodaysAssignmentCard today={today.data} />
          ) : null}

          <ContentCard title="Your Progress">
            {statistics.isPending ? (
              <LoadingSkeleton variant="card" />
            ) : statistics.isError ? (
              <ErrorState description="Couldn't load statistics." onRetry={() => statistics.refetch()} />
            ) : statistics.data ? (
              <StatisticsGrid statistics={statistics.data} />
            ) : null}
          </ContentCard>

          <ContentCard title="History">
            {history.isPending ? (
              <LoadingSkeleton variant="list" count={5} />
            ) : history.isError ? (
              <ErrorState description="Couldn't load history." onRetry={() => history.refetch()} />
            ) : history.data && history.data.data.length > 0 ? (
              <div className="space-y-4">
                <HistoryTable items={history.data.data} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Page {history.data.meta.page} of {history.data.meta.totalPages || 1}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!history.data.meta.hasPreviousPage}
                      onClick={() => setHistoryPage((current) => current - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!history.data.meta.hasNextPage}
                      onClick={() => setHistoryPage((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No history yet" description="Completed assignments will show up here." />
            )}
          </ContentCard>
        </>
      )}
    </PageContainer>
  );
}
