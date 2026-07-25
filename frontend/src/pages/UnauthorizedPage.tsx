import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routePaths";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-background p-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">403</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="text-sm text-muted-foreground">You don't have permission to access this page.</p>
      </div>
      <Button asChild>
        <Link to={ROUTES.HOME}>Go home</Link>
      </Button>
    </div>
  );
}
