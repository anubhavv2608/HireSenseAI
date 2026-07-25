import { useQuery } from "@tanstack/react-query";
import { challengesApi } from "../api/challenges.api";
import { challengeKeys } from "../api/queryKeys";
import type { ChallengeListType } from "../types/challenges.types";

const STALE_TIME_MS = 5 * 60_000;

export function useChallenges(type: ChallengeListType, page?: number) {
  return useQuery({
    queryKey: challengeKeys.list(type, page),
    queryFn: () => challengesApi.list(type, page),
    staleTime: STALE_TIME_MS,
  });
}
