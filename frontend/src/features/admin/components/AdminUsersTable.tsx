import { AdminUserRowItem } from "./AdminUserRowItem";
import type { AdminUserRow } from "../types/admin.types";

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  return (
    <>
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">User</th>
            <th className="pb-2 pr-4 font-medium">Role</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Streak</th>
            <th className="pb-2 pr-4 font-medium">Joined</th>
            <th className="sr-only pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <AdminUserRowItem key={user.userId} user={user} layout="row" />
          ))}
        </tbody>
      </table>
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <AdminUserRowItem key={user.userId} user={user} layout="card" />
        ))}
      </div>
    </>
  );
}
