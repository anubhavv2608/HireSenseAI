import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { Challenge, ChallengeListType, ChallengeProblem, PaginatedResult } from "../types/challenges.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const challengesApi = {
  create: async (opponentUserId: string, problem: ChallengeProblem): Promise<Challenge> => {
    const { challenge } = await unwrap<{ challenge: Challenge }>(
      apiClient.post("/challenges", { opponentUserId, problem }),
    );
    return challenge;
  },

  accept: async (id: string): Promise<Challenge> => {
    const { challenge } = await unwrap<{ challenge: Challenge }>(apiClient.post(`/challenges/${id}/accept`));
    return challenge;
  },

  decline: async (id: string): Promise<Challenge> => {
    const { challenge } = await unwrap<{ challenge: Challenge }>(apiClient.post(`/challenges/${id}/decline`));
    return challenge;
  },

  cancel: async (id: string): Promise<Challenge> => {
    const { challenge } = await unwrap<{ challenge: Challenge }>(apiClient.post(`/challenges/${id}/cancel`));
    return challenge;
  },

  complete: async (id: string): Promise<Challenge> => {
    const { challenge } = await unwrap<{ challenge: Challenge }>(apiClient.post(`/challenges/${id}/complete`));
    return challenge;
  },

  list: (type: ChallengeListType, page?: number, limit?: number): Promise<PaginatedResult<Challenge>> =>
    unwrap(apiClient.get("/challenges", { params: { type, page, limit } })),
};
