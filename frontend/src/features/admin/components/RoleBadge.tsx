import { Badge } from "@/components/ui/badge";
import type { Role } from "@/features/auth/types/auth.types";

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  student: { label: "Student", className: "bg-muted text-muted-foreground" },
  admin: { label: "Admin", className: "bg-info/10 text-info" },
  super_admin: {
    label: "Super Admin",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  },
};

export function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
