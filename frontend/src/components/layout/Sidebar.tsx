import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserPlus,
  UserSearch,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/routes/routePaths";
import type { Role } from "@/features/auth/types/auth.types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: readonly Role[];
}

interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, roles: ["student", "admin", "super_admin"] },
      { to: ROUTES.DAILY_DSA, label: "Daily DSA", icon: ClipboardList, roles: ["student"] },
      { to: ROUTES.RESUME, label: "Resume", icon: FileText, roles: ["student", "admin", "super_admin"] },
      {
        to: ROUTES.RESUME_ANALYSIS,
        label: "Resume Analysis",
        icon: Sparkles,
        roles: ["student", "admin", "super_admin"],
      },
      { to: ROUTES.JOB_ANALYSIS, label: "Job Match", icon: Target, roles: ["student", "admin", "super_admin"] },
      { to: ROUTES.INTERVIEW, label: "Interview", icon: MessagesSquare, roles: ["student", "admin", "super_admin"] },
    ],
  },
  {
    label: "Community",
    items: [
      { to: ROUTES.STUDENT_SEARCH, label: "Students", icon: UserSearch, roles: ["student", "admin", "super_admin"] },
      { to: ROUTES.FRIENDS, label: "Friends", icon: UserPlus, roles: ["student", "admin", "super_admin"] },
      { to: ROUTES.CHALLENGES, label: "Challenges", icon: Swords, roles: ["student", "admin", "super_admin"] },
      { to: ROUTES.LEADERBOARD, label: "Leaderboard", icon: Trophy, roles: ["student", "admin", "super_admin"] },
    ],
  },
  {
    label: "Account",
    items: [{ to: ROUTES.SETTINGS, label: "Settings", icon: Settings, roles: ["student", "admin", "super_admin"] }],
  },
  {
    label: "Admin",
    items: [
      {
        to: ROUTES.ADMIN_DASHBOARD,
        label: "Admin Dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "super_admin"],
      },
      { to: ROUTES.ADMIN_USERS, label: "Users", icon: Users, roles: ["admin", "super_admin"] },
      { to: ROUTES.ADMIN_RESUMES, label: "Resumes", icon: FileText, roles: ["admin", "super_admin"] },
      { to: ROUTES.ADMIN_DAILY_DSA, label: "Daily DSA", icon: ClipboardList, roles: ["admin", "super_admin"] },
    ],
  },
] as const;

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user } = useAuth();

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !!user && item.roles.includes(user.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav aria-label="Primary" className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {visibleGroups.map((group, groupIndex) => (
        <div key={group.label} className={cn(groupIndex > 0 && "mt-3")}>
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-medium tracking-wider text-sidebar-muted-foreground uppercase">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 border-l-[3px] border-transparent py-2 pr-3 pl-[9px] text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none",
                    isActive && "border-sidebar-accent bg-white/5 font-semibold text-white hover:text-white",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
