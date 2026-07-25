import { ClipboardCheck, Flame, FileText, Users } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ContentCard } from "@/components/common/ContentCard";
import { StatTile } from "@/components/common/StatTile";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const summary = useAdminDashboard();

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform-wide activity at a glance." />

      {summary.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : summary.isError ? (
        <ErrorState description="Couldn't load the dashboard." onRetry={() => summary.refetch()} />
      ) : summary.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Users}
              value={summary.data.totalUsers}
              label="Total Users"
              description={`${summary.data.activeUsers} active (last 30 days)`}
            />
            <StatTile
              icon={FileText}
              value={summary.data.resumesUploaded}
              label="Resumes"
              description={`${summary.data.resumesProcessed} processed`}
            />
            <StatTile
              icon={ClipboardCheck}
              value={summary.data.dailyDsaParticipants}
              label="Daily DSA Participants"
              description={`${summary.data.todaysCompletionRate}% completed today`}
            />
            <StatTile
              icon={Flame}
              value={`${Math.round(summary.data.averageStreak)}d`}
              label="Average Streak"
            />
          </div>

          <ContentCard title="Recent Activity">
            {summary.data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-2">
                {summary.data.recentActivity.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {item.userEmail} completed <span className="font-medium">{item.assignmentTitle}</span>
                    </span>
                    <span className="text-muted-foreground">{formatDate(item.completedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </ContentCard>
        </>
      ) : null}
    </PageContainer>
  );
}
