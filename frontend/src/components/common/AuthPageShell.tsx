import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/common/Brand";
import { ROUTES } from "@/routes/routePaths";

interface AuthPageShellProps {
  title: string;
  description?: string;
  tabs?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageShell({ title, description, tabs, children, footer }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-background p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary)/0.08),_transparent_55%)]"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <Link to={ROUTES.HOME} className="mb-8 flex items-center justify-center">
          <Brand withWordmark />
        </Link>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="h-1 bg-primary" aria-hidden="true" />
          <div className="p-6">
            {tabs}
            <div className="mb-6 space-y-1 text-center">
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {children}
          </div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
