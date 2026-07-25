import { StatusBadge } from "@/components/common/StatusBadge";
import { RoleBadge } from "./RoleBadge";
import { AdminUserActions } from "./AdminUserActions";
import type { AdminUserRow } from "../types/admin.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

interface AdminUserRowItemProps {
  user: AdminUserRow;
  layout: "row" | "card";
}

export function AdminUserRowItem({ user, layout }: AdminUserRowItemProps) {
  if (layout === "card") {
    return (
      <div className="space-y-2 rounded-lg border border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{user.fullName ?? user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <AdminUserActions user={user} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RoleBadge role={user.role} />
          <StatusBadge tone={user.isActive ? "success" : "neutral"}>
            {user.isActive ? "Active" : "Disabled"}
          </StatusBadge>
        </div>
        <p className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
      </div>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-foreground">{user.fullName ?? user.email}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </td>
      <td className="py-3 pr-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-3 pr-4">
        <StatusBadge tone={user.isActive ? "success" : "neutral"}>
          {user.isActive ? "Active" : "Disabled"}
        </StatusBadge>
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">{user.currentStreak}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
      <td className="py-3 text-right">
        <AdminUserActions user={user} />
      </td>
    </tr>
  );
}
