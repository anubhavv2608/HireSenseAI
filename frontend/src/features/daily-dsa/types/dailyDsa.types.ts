export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface DailyAssignment {
  _id: string;
  title: string;
  leetcodeProblemId: string;
  leetcodeUrl: string;
  difficulty: Difficulty;
  topic: string;
  description?: string | null;
  date: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodayAssignmentResult {
  assignment: DailyAssignment;
  completed: boolean;
  /**
   * Not returned by GET /today — populated client-side in the query cache
   * immediately after a successful completion, from the /complete response.
   */
  completedAt?: string;
}

export interface HistoryItem {
  assignment: DailyAssignment;
  completed: boolean;
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

export interface DailyDsaCompletionStats {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  completionRate: number;
  lastCompletedDate: string | null;
}

export interface CompletionRecord {
  _id: string;
  userId: string;
  assignmentId: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteAssignmentResult {
  completion: CompletionRecord;
  stats: DailyDsaCompletionStats;
  alreadyCompleted: boolean;
}

export interface DailyDsaStatisticsSummary {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  completionRate: number;
  currentRank: number;
  monthlyCompletion: number;
  weeklyCompletion: number;
  totalChallenges: number;
}

export interface HistoryQuery {
  page?: number;
  limit?: number;
}
