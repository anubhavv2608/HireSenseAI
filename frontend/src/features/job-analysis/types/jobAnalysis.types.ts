export type JobAnalysisStatus = "PENDING" | "ANALYZING" | "COMPLETED" | "FAILED" | "SKIPPED_ALREADY_ANALYZED";

export type HiringRecommendation = "STRONG_MATCH" | "GOOD_MATCH" | "PARTIAL_MATCH" | "WEAK_MATCH";

export const JOB_DESCRIPTION_MAX_LENGTH = 10_000;

export interface ExtractedRequirements {
  languages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  softSkills: string[];
}

export interface JobDescriptionAnalysis {
  _id: string;
  resumeId: string;
  parseId: string;
  userId: string;
  jobDescription: string;
  jobDescriptionHash: string;
  analysisStatus: JobAnalysisStatus;
  analysisVersion: number;
  promptVersion: number;
  provider: string | null;
  aiModel: string | null;
  overallMatchScore: number | null;
  summary: string | null;
  matchingSkills: string[] | null;
  missingSkills: string[] | null;
  matchingExperience: string[] | null;
  experienceGaps: string[] | null;
  educationMatch: string | null;
  projectRelevance: string | null;
  keywordCoverage: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  hiringRecommendation: HiringRecommendation | null;
  priorityImprovements: string[] | null;
  extractedRequirements: ExtractedRequirements | null;
  learningRoadmap: string[] | null;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  lastAttemptedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfAnalysisId: string | null;
  createdAt: string;
  updatedAt: string;
}

const COMPLETED_JOB_ANALYSIS_STATUSES: JobAnalysisStatus[] = ["COMPLETED", "SKIPPED_ALREADY_ANALYZED"];

export function isCompletedJobAnalysis(status: JobAnalysisStatus): boolean {
  return COMPLETED_JOB_ANALYSIS_STATUSES.includes(status);
}
