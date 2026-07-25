import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";

export function useAdminResumes(query: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: adminKeys.resumes(query),
    queryFn: () => adminApi.listResumes(query),
  });
}
