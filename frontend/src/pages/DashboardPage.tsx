import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboardSummary";
import { DailyDsaHeroCard } from "@/features/dashboard/components/DailyDsaHeroCard";
import { ResumeScoreHeroCard } from "@/features/dashboard/components/ResumeScoreHeroCard";
import { ResumeStatusCard } from "@/features/dashboard/components/ResumeStatusCard";
import { QuickActionsCard } from "@/features/dashboard/components/QuickActionsCard";
import { RecentActivityTimeline } from "@/features/dashboard/components/RecentActivityTimeline";
import { ProfileSummaryCard } from "@/features/dashboard/components/ProfileSummaryCard";
import { NotificationsWidget } from "@/features/dashboard/components/NotificationsWidget";
import { FriendRequestsWidget } from "@/features/dashboard/components/FriendRequestsWidget";
import { ChallengesWidget } from "@/features/dashboard/components/ChallengesWidget";
import { LeaderboardPreviewWidget } from "@/features/dashboard/components/LeaderboardPreviewWidget";
import { CommunityActivityWidget } from "@/features/dashboard/components/CommunityActivityWidget";
import { DashboardStatsRow } from "@/features/dashboard/components/DashboardStatsRow";
import { useCurrentResume } from "@/features/resume/hooks/useCurrentResume";
import { ResumeCard } from "@/features/resume/components/ResumeCard";
import { ProcessingStatusCard } from "@/features/resume/components/ProcessingStatusCard";
import { EmptyResumeState } from "@/features/resume/components/EmptyResumeState";

export default function DashboardPage() {
  const { user } = useAuth();
  const summary = useDashboardSummary();
  const currentResume = useCurrentResume();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={user ? `Welcome back, ${user.email}.` : "An overview of your job search activity."}
      />

      {/* Profile card doesn't depend on the dashboard summary at all, so it's
          deliberately outside that gate below - it fires concurrently with it
          on mount instead of waterfalling behind it. */}
      <ProfileSummaryCard />

      <DailyDsaHeroCard />

      {summary.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : summary.isError ? (
        <ErrorState description="Couldn't load your dashboard." onRetry={() => summary.refetch()} />
      ) : summary.data ? (
        <ResumeScoreHeroCard summary={summary.data} />
      ) : null}

      <Section title="Community">
        <div className="grid gap-6 md:grid-cols-3">
          <NotificationsWidget />
          <FriendRequestsWidget />
          <ChallengesWidget />
        </div>
        <div className="mt-6">
          <LeaderboardPreviewWidget />
        </div>
      </Section>

      <DashboardStatsRow />

      {summary.isPending ? (
        <LoadingSkeleton variant="card" />
      ) : summary.data ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <ResumeStatusCard summary={summary.data} />
            <QuickActionsCard hasResume={Boolean(summary.data.latestResume)} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {currentResume.isPending ? (
              <LoadingSkeleton variant="card" />
            ) : currentResume.isEmpty ? (
              <EmptyResumeState />
            ) : currentResume.data ? (
              <ResumeCard resume={currentResume.data} title="Active Resume" />
            ) : null}

            {currentResume.data && <ProcessingStatusCard resumeId={currentResume.data._id} />}
          </div>

          <RecentActivityTimeline timeline={summary.data.timeline} />
        </>
      ) : null}

      <CommunityActivityWidget />
    </PageContainer>
  );
}
