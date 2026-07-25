import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface TagListProps {
  label: string;
  items: string[];
  tone?: StatusTone;
  emptyFallback?: string;
  className?: string;
}

export function TagList({ label, items, tone = "neutral", emptyFallback, className }: TagListProps) {
  if (items.length === 0 && !emptyFallback) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyFallback}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <StatusBadge key={item} tone={tone}>
              {item}
            </StatusBadge>
          ))}
        </div>
      )}
    </div>
  );
}
