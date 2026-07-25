import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  const headingId = useId();

  return (
    <section className={cn("space-y-4", className)} aria-labelledby={title ? headingId : undefined}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 id={headingId} className="text-lg font-medium text-foreground">
              {title}
            </h2>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
