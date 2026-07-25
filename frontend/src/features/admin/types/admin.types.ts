import type { Role } from "@/features/auth/types/auth.types";

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

export interface AdminUserRow {
  userId: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  dailyDsaEnabled: boolean;
  currentStreak: number;
  fullName: string | null;
  resumeStatus: string | null;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "newest" | "oldest";
}

export interface AdminRecentActivityItem {
  userEmail: string;
  assignmentTitle: string;
  completedAt: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  activeUsers: number;
  resumesUploaded: number;
  resumesProcessed: number;
  dailyDsaParticipants: number;
  todaysCompletionRate: number;
  averageStreak: number;
  recentActivity: AdminRecentActivityItem[];
}

export interface AdminResumeRow {
  resumeId: string;
  userId: string;
  originalFilename: string;
  storageProvider: string;
  isActive: boolean;
  uploadedAt: string;
  processingStatus: string | null;
  hasAnalysis: boolean;
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface AdminAssignmentRow {
  _id: string;
  title: string;
  leetcodeProblemId: string;
  leetcodeUrl: string;
  difficulty: Difficulty;
  topic: string;
  description: string;
  date: string;
  isPublished: boolean;
}

export interface CreateAssignmentPayload {
  title: string;
  leetcodeProblemId: string;
  leetcodeUrl: string;
  difficulty: Difficulty;
  topic: string;
  description?: string;
  date: string;
}
