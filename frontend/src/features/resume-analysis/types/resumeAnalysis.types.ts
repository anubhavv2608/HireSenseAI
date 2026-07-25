export type ResumeAnalysisStatus =
  | "PENDING"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED_ALREADY_ANALYZED";

export interface ResumeAnalysisCategoryScores {
  projects: number;
  experience: number;
  education: number;
  skills: number;
  leadership: number;
  completeness: number;
}

export interface DetailedScoreEntry {
  score: number;
  explanation: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface ResumeAnalysisDetailedScores {
  atsCompatibility: DetailedScoreEntry;
  resumeStructure: DetailedScoreEntry;
  technicalSkills: DetailedScoreEntry;
  projects: DetailedScoreEntry;
  experience: DetailedScoreEntry;
  education: DetailedScoreEntry;
  achievementQuality: DetailedScoreEntry;
  overallScore: DetailedScoreEntry;
}

export interface ResumeAnalysis {
  _id: string;
  resumeId: string;
  parseId: string;
  userId: string;
  analysisStatus: ResumeAnalysisStatus;
  analysisVersion: number;
  promptVersion: number;
  provider: string | null;
  aiModel: string | null;
  overallScore: number | null;
  summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  categoryScores: ResumeAnalysisCategoryScores | null;
  detailedScores: ResumeAnalysisDetailedScores | null;
  missingSections: string[] | null;
  priorityImprovements: string[] | null;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  lastAttemptedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

const COMPLETED_ANALYSIS_STATUSES: ResumeAnalysisStatus[] = ["COMPLETED", "SKIPPED_ALREADY_ANALYZED"];

export function isCompletedAnalysis(status: ResumeAnalysisStatus): boolean {
  return COMPLETED_ANALYSIS_STATUSES.includes(status);
}
