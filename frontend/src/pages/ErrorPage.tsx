import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routePaths";

interface ErrorPageProps {
  onRetry?: () => void;
}

export default function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-background p-4 text-center">
      <AlertOctagon className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or head back home.
        </p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry}>Try again</Button>
      ) : (
        <Button onClick={() => window.location.assign(ROUTES.HOME)}>Go home</Button>
      )}
    </div>
  );
}
