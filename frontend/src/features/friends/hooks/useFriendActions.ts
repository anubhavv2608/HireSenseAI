import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { friendsApi } from "../api/friends.api";
import { friendKeys } from "../api/queryKeys";
import type { FriendStatus, FriendStatusResult } from "../types/friends.types";

interface OptimisticContext {
  previous: FriendStatusResult | undefined;
  targetUserId: string;
}

function useOptimisticStatusMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  getTargetUserId: (vars: TVars) => string,
  nextStatus: FriendStatus,
) {
  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars): Promise<OptimisticContext> => {
      const targetUserId = getTargetUserId(vars);
      const key = friendKeys.status(targetUserId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FriendStatusResult>(key);
      queryClient.setQueryData<FriendStatusResult>(key, { status: nextStatus, requestId: null });
      return { previous, targetUserId };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(friendKeys.status(context.targetUserId), context.previous);
      }
    },
    onSettled: (_data, _error, vars) => {
      const targetUserId = getTargetUserId(vars);
      queryClient.invalidateQueries({ queryKey: friendKeys.status(targetUserId) });
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useSendFriendRequest() {
  return useOptimisticStatusMutation(
    (targetUserId: string) => friendsApi.sendRequest(targetUserId),
    (targetUserId) => targetUserId,
    "pending_outgoing",
  );
}

interface RequestActionVars {
  requestId: string;
  targetUserId: string;
}

export function useAcceptFriendRequest() {
  return useOptimisticStatusMutation(
    (vars: RequestActionVars) => friendsApi.acceptRequest(vars.requestId),
    (vars) => vars.targetUserId,
    "friends",
  );
}

export function useRejectFriendRequest() {
  return useOptimisticStatusMutation(
    (vars: RequestActionVars) => friendsApi.rejectRequest(vars.requestId),
    (vars) => vars.targetUserId,
    "none",
  );
}

export function useCancelFriendRequest() {
  return useOptimisticStatusMutation(
    (vars: RequestActionVars) => friendsApi.cancelRequest(vars.requestId),
    (vars) => vars.targetUserId,
    "none",
  );
}

export function useRemoveFriend() {
  return useOptimisticStatusMutation(
    (targetUserId: string) => friendsApi.removeFriend(targetUserId),
    (targetUserId) => targetUserId,
    "none",
  );
}
