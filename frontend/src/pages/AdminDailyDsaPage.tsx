import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAdminAssignments } from "@/features/admin/hooks/useAdminAssignments";
import { usePublishAssignment } from "@/features/admin/hooks/usePublishAssignment";
import { CreateAssignmentDialog } from "@/features/admin/components/CreateAssignmentDialog";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminDailyDsaPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const query = useAdminAssignments({ page, limit: 10 });
  const publishMutation = usePublishAssignment();

  function handlePublish(id: string) {
    publishMutation.mutate(id, {
      onSuccess: () => toastSuccess("Assignment published"),
      onError: (error) => toastError("Couldn't publish assignment", isApiError(error) ? error.message : undefined),
    });
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Daily DSA"
        description="Create and publish daily DSA assignments."
        actions={<Button onClick={() => setCreateOpen(true)}>Create assignment</Button>}
      />

      {query.isPending ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : query.isError ? (
        <ErrorState description="Couldn't load assignments." onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Topic</th>
                <th className="pb-2 pr-4 font-medium">Difficulty</th>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="sr-only pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((assignment) => (
                <tr key={assignment._id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{assignment.title}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{assignment.topic}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground capitalize">
                    {assignment.difficulty.toLowerCase()}
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{formatDate(assignment.date)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge tone={assignment.isPublished ? "success" : "neutral"}>
                      {assignment.isPublished ? "Published" : "Draft"}
                    </StatusBadge>
                  </td>
                  <td className="py-3 text-right">
                    {!assignment.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={publishMutation.isPending}
                        onClick={() => handlePublish(assignment._id)}
                      >
                        Publish
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {query.data.meta.page} of {query.data.meta.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!query.data.meta.hasPreviousPage}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!query.data.meta.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <CreateAssignmentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </PageContainer>
  );
}
