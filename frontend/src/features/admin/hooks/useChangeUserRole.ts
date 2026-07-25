import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import type { Role } from "@/features/auth/types/auth.types";

export function useChangeUserRole() {
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminApi.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
