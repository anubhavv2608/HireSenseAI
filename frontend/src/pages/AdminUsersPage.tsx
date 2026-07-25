import { useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { AdminUsersTable } from "@/features/admin/components/AdminUsersTable";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useAdminUsers({ page, limit: 10, search: search || undefined });

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Users" description="Manage student, admin, and super admin accounts." />

      <Input
        placeholder="Search by name or email…"
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
        <ErrorState description="Couldn't load users." onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <AdminUsersTable users={query.data.data} />
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
