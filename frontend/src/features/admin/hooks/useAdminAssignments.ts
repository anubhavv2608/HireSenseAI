import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";

export function useAdminAssignments(query: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.assignments(query),
    queryFn: () => adminApi.listAssignments(query),
  });
}
