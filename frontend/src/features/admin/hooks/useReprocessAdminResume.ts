import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useReprocessAdminResume() {
  return useMutation({
    mutationFn: (id: string) => adminApi.reprocessResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
