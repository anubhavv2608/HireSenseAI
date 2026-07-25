import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { challengesApi } from "../api/challenges.api";
import { challengeKeys } from "../api/queryKeys";
import type { ChallengeProblem } from "../types/challenges.types";

function invalidateAll() {
  queryClient.invalidateQueries({ queryKey: challengeKeys.all });
}

export function useCreateChallenge() {
  return useMutation({
    mutationFn: ({ opponentUserId, problem }: { opponentUserId: string; problem: ChallengeProblem }) =>
      challengesApi.create(opponentUserId, problem),
    onSuccess: invalidateAll,
  });
}

export function useAcceptChallenge() {
  return useMutation({
    mutationFn: (id: string) => challengesApi.accept(id),
    onSuccess: invalidateAll,
  });
}

export function useDeclineChallenge() {
  return useMutation({
    mutationFn: (id: string) => challengesApi.decline(id),
    onSuccess: invalidateAll,
  });
}

export function useCancelChallenge() {
  return useMutation({
    mutationFn: (id: string) => challengesApi.cancel(id),
    onSuccess: invalidateAll,
  });
}

export function useCompleteChallenge() {
  return useMutation({
    mutationFn: (id: string) => challengesApi.complete(id),
    onSuccess: invalidateAll,
  });
}
