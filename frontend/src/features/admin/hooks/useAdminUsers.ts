import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";
import type { AdminUsersQuery } from "../types/admin.types";

export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => adminApi.listUsers(query),
  });
}
