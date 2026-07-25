import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useChallenges } from "../hooks/useChallenges";
import { ChallengeCard } from "../components/ChallengeCard";
import type { ChallengeListType } from "../types/challenges.types";

const TABS = ["incoming", "outgoing", "active", "completed"] as const satisfies readonly ChallengeListType[];
type Tab = (typeof TABS)[number];

function isTab(value: string | null): value is Tab {
  return !!value && (TABS as readonly string[]).includes(value);
}

const EMPTY_COPY: Record<Tab, { title: string; description: string }> = {
  incoming: { title: "No incoming challenges", description: "Challenges sent to you will show up here." },
  outgoing: { title: "No outgoing challenges", description: "Challenges you've sent will show up here." },
  active: { title: "No active challenges", description: "Accepted challenges in progress will show up here." },
  completed: { title: "No completed challenges yet", description: "Finished challenges will show up here." },
};

export default function ChallengesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = isTab(searchParams.get("tab")) ? (searchParams.get("tab") as Tab) : "incoming";

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Challenges" description="Challenge other students or your friends to solve a problem." />

      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {TABS.map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="pt-4">
            <ChallengeListTab type={tabValue} viewerUserId={user?._id ?? ""} />
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}

function ChallengeListTab({ type, viewerUserId }: { type: ChallengeListType; viewerUserId: string }) {
  const [page, setPage] = useState(1);
  const query = useChallenges(type, page);

  if (query.isPending) return <LoadingSkeleton variant="list" count={4} />;
  if (query.isError) return <ErrorState description="Couldn't load challenges." onRetry={() => query.refetch()} />;
  if (query.data.data.length === 0) {
    const copy = EMPTY_COPY[type as Tab];
    return <EmptyState title={copy.title} description={copy.description} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {query.data.data.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} viewerUserId={viewerUserId} />
        ))}
      </div>
      <Pagination meta={query.data.meta} onPageChange={setPage} />
    </div>
  );
}
