import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../api/admin.api";
import { adminKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useCreateAssignment() {
  return useMutation({
    mutationFn: adminApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
