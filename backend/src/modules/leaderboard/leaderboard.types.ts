import { PaginationQuery } from '../../shared/types';
import { SCOPE_VALUES } from './leaderboard.constants';

export type LeaderboardScope = (typeof SCOPE_VALUES)[number];

export interface LeaderboardQuery extends PaginationQuery {
  scope: LeaderboardScope;
  search?: string;
}

export interface LeaderboardRow {
  userId: string;
  username: string | null;
  fullName: string | null;
  currentStreak: number;
  totalCompleted: number;
}

export interface RankedLeaderboardRow extends LeaderboardRow {
  rank: number;
}

export interface CurrentUserPosition {
  rank: number;
  currentStreak: number;
  totalCompleted: number;
}
