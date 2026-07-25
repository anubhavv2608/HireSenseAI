import type { ChallengeListType } from "../types/challenges.types";

export const challengeKeys = {
  all: ["challenges"] as const,
  list: (type: ChallengeListType, page?: number) => [...challengeKeys.all, "list", type, page ?? 1] as const,
  detail: (id: string) => [...challengeKeys.all, "detail", id] as const,
};
