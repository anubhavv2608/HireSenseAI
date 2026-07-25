import { Badge } from "@/components/ui/badge";

export function ResumeStatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className="capitalize">
      {label}
    </Badge>
  );
}
