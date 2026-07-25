export const DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type Difficulty = (typeof DIFFICULTY_VALUES)[number];

export interface DailyDsaStats {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
  completionRate: number;
  lastCompletedDate: Date | null;
}
