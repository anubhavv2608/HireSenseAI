import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useSetUserActive() {
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.setUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
