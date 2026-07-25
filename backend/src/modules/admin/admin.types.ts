export interface RecentActivityItem {
  userEmail: string;
  assignmentTitle: string;
  completedAt: Date;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  resumesUploaded: number;
  resumesProcessed: number;
  dailyDsaParticipants: number;
  todaysCompletionRate: number;
  averageStreak: number;
  recentActivity: RecentActivityItem[];
}
