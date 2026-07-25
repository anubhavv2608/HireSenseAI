import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useAdminResumes } from "@/features/admin/hooks/useAdminResumes";
import { useDeleteAdminResume } from "@/features/admin/hooks/useDeleteAdminResume";
import { useReprocessAdminResume } from "@/features/admin/hooks/useReprocessAdminResume";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminResumesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useAdminResumes({ page, limit: 10, search: search || undefined });
  const deleteMutation = useDeleteAdminResume();
  const reprocessMutation = useReprocessAdminResume();

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => toastSuccess("Resume deleted"),
      onError: (error) => toastError("Couldn't delete resume", isApiError(error) ? error.message : undefined),
    });
  }

  function handleReprocess(id: string) {
    reprocessMutation.mutate(id, {
      onSuccess: () => toastSuccess("Reprocessing started"),
      onError: (error) => toastError("Couldn't reprocess resume", isApiError(error) ? error.message : undefined),
    });
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Resumes" description="Review and manage uploaded resumes." />

      <Input
        placeholder="Search by filename…"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {query.isPending ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : query.isError ? (
        <ErrorState description="Couldn't load resumes." onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">File name</th>
                <th className="pb-2 pr-4 font-medium">Uploaded</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Active</th>
                <th className="sr-only pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((resume) => (
                <tr key={resume.resumeId} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium break-all text-foreground">{resume.originalFilename}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground">{formatDate(resume.uploadedAt)}</td>
                  <td className="py-3 pr-4 text-sm text-muted-foreground capitalize">
                    {resume.processingStatus ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {resume.isActive && <StatusBadge tone="success">Active</StatusBadge>}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reprocessMutation.isPending}
                        onClick={() => handleReprocess(resume.resumeId)}
                      >
                        Reprocess
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(resume.resumeId)}
                      >
                        Delete
                      </Button>
                    </div>
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
    </PageContainer>
  );
}
