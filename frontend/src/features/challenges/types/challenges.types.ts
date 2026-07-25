export type ChallengeStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";
export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ChallengeListType = "incoming" | "outgoing" | "active" | "completed";

export interface ChallengeProblem {
  title: string;
  url?: string;
  difficulty?: ChallengeDifficulty;
  notes?: string;
}

export interface ChallengeParticipant {
  userId: string;
  username: string | null;
  name: string;
}

export interface Challenge {
  id: string;
  challenger: ChallengeParticipant;
  opponent: ChallengeParticipant;
  problem: ChallengeProblem;
  status: ChallengeStatus;
  challengerCompletedAt: string | null;
  opponentCompletedAt: string | null;
  winnerId: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
