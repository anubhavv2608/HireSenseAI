import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation";
import { ROUTE_TITLES, ROUTES } from "@/routes/routePaths";

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
}

export function Navbar({ onToggleSidebar, onOpenMobileNav }: NavbarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const title = ROUTE_TITLES[location.pathname] ?? "";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden lg:inline-flex"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-4" />
      </Button>
      <span className="text-sm text-muted-foreground">{title}</span>

      <div className="flex-1" />

      {user && <NotificationBell />}

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account menu"
            >
              <UserAvatar email={user.email} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="max-w-52 truncate font-normal text-muted-foreground">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE}>My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setConfirmLogoutOpen(true);
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ConfirmationDialog
        open={confirmLogoutOpen}
        onOpenChange={setConfirmLogoutOpen}
        title="Log out?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        variant="destructive"
        isConfirming={logoutMutation.isPending}
        onConfirm={() => logoutMutation.mutate()}
      />
    </header>
  );
}
