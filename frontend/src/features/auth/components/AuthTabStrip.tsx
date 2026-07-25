import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/routePaths";

const TABS = [
  { to: ROUTES.LOGIN, label: "Login" },
  { to: ROUTES.REGISTER, label: "Sign Up" },
] as const;

export function AuthTabStrip() {
  const { pathname } = useLocation();

  return (
    <div className="mb-6 flex gap-1">
      {TABS.map((tab) => {
        const isActive = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "relative flex-1 py-2 text-center text-sm font-medium text-foreground/60 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity hover:text-foreground",
              isActive && "font-semibold text-foreground after:opacity-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
