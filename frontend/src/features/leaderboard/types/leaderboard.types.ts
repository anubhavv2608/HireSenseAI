export type LeaderboardScope = "daily" | "weekly" | "monthly" | "overall";

export interface LeaderboardRow {
  userId: string;
  username: string | null;
  fullName: string | null;
  currentStreak: number;
  totalCompleted: number;
  rank: number;
}

export interface CurrentUserPosition {
  rank: number;
  currentStreak: number;
  totalCompleted: number;
}

export interface LeaderboardQuery {
  scope: LeaderboardScope;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardResult {
  data: LeaderboardRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  currentUserPosition: CurrentUserPosition;
}
