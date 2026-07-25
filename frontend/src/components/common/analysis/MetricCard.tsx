import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  className?: string;
}

export function MetricCard({ label, value, className }: MetricCardProps) {
  return (
    <div className={cn("space-y-2 rounded-lg border border-border p-3", className)}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-xl font-medium text-foreground">{value}</p>
      <Progress value={value} />
    </div>
  );
}
