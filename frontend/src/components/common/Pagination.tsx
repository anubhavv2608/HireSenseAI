import { Button } from "@/components/ui/button";

interface PaginationMeta {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {meta.page} of {meta.totalPages || 1}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
