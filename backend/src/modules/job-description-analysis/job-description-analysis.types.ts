import { Types } from 'mongoose';
import { z } from 'zod';
import { ANALYSIS_STATUS } from './job-description-analysis.constants';

export type AnalysisStatus = (typeof ANALYSIS_STATUS)[keyof typeof ANALYSIS_STATUS];

export const HIRING_RECOMMENDATION_VALUES = ['STRONG_MATCH', 'GOOD_MATCH', 'PARTIAL_MATCH', 'WEAK_MATCH'] as const;

// Additive structured JD extraction, separate from the resume-comparison
// fields above - lets the frontend show "what this JD actually asks for"
// independently of how well the candidate's resume matches it.
const extractedRequirementsSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  libraries: z.array(z.string()),
  databases: z.array(z.string()),
  responsibilities: z.array(z.string()),
  requiredQualifications: z.array(z.string()),
  preferredQualifications: z.array(z.string()),
  softSkills: z.array(z.string()),
});

export type ExtractedRequirements = z.infer<typeof extractedRequirementsSchema>;

// overallMatchScore/keywordCoverage are required numbers, not nullable: the AI
// must always produce a judgment, even "0% keyword coverage" is a valid,
// meaningful answer for a poor match, not an "unknown."
export const jobDescriptionAnalysisResultSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  summary: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchingExperience: z.array(z.string()),
  experienceGaps: z.array(z.string()),
  educationMatch: z.string(),
  projectRelevance: z.string(),
  keywordCoverage: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  hiringRecommendation: z.enum(HIRING_RECOMMENDATION_VALUES),
  priorityImprovements: z.array(z.string()),
  // Additive fields (all existing fields above are untouched).
  extractedRequirements: extractedRequirementsSchema,
  learningRoadmap: z.array(z.string()),
});

export type JobDescriptionAnalysisResult = z.infer<typeof jobDescriptionAnalysisResultSchema>;

export interface IJobDescriptionAnalysis {
  _id: string;
  resumeId: Types.ObjectId | string;
  parseId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  jobDescription: string;
  jobDescriptionHash: string;
  analysisStatus: AnalysisStatus;
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
  hiringRecommendation: string | null;
  priorityImprovements: string[] | null;
  extractedRequirements: ExtractedRequirements | null;
  learningRoadmap: string[] | null;
  analysisStartedAt: Date | null;
  analysisCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfAnalysisId: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyzeJobDescriptionDTO {
  resumeId: string;
  jobDescription: string;
}

export interface AnalysisStatusSummary {
  resumeId: string;
  parseId: string;
  analysisStatus: AnalysisStatus;
  analysisVersion: number;
  promptVersion: number;
  analysisStartedAt: Date | null;
  analysisCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
}
