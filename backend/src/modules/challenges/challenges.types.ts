import { CHALLENGE_STATUSES, CHALLENGE_DIFFICULTIES, CHALLENGE_LIST_TYPES } from './challenges.constants';

export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];
export type ChallengeDifficulty = (typeof CHALLENGE_DIFFICULTIES)[number];
export type ChallengeListType = (typeof CHALLENGE_LIST_TYPES)[number];

export interface ChallengeProblemInput {
  title: string;
  url?: string;
  difficulty?: ChallengeDifficulty;
  notes?: string;
}

export interface ChallengeParticipantDTO {
  userId: string;
  username: string | null;
  name: string;
}

export interface ChallengeDTO {
  id: string;
  challenger: ChallengeParticipantDTO;
  opponent: ChallengeParticipantDTO;
  problem: ChallengeProblemInput;
  status: ChallengeStatus;
  challengerCompletedAt: Date | null;
  opponentCompletedAt: Date | null;
  winnerId: string | null;
  createdAt: Date;
}
