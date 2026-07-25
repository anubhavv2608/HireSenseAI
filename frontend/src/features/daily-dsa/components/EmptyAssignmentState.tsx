import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export function EmptyAssignmentState() {
  return (
    <EmptyState
      icon={CalendarX}
      title="No assignment today"
      description="Check back soon — a new Daily DSA challenge hasn't been published yet."
    />
  );
}
