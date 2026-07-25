import { Types } from 'mongoose';
import { z } from 'zod';
import { ANALYSIS_STATUS } from './resume-analysis.constants';

export type AnalysisStatus = (typeof ANALYSIS_STATUS)[keyof typeof ANALYSIS_STATUS];

export const CATEGORY_SCORE_KEYS = [
  'projects',
  'experience',
  'education',
  'skills',
  'leadership',
  'completeness',
] as const;

// A separate, additive set of dimensions alongside the original CATEGORY_SCORE_KEYS
// (kept untouched for backward compatibility) — each carries its own explanation/
// strengths/weaknesses/improvements rather than a bare number.
export const DETAILED_SCORE_KEYS = [
  'atsCompatibility',
  'resumeStructure',
  'technicalSkills',
  'projects',
  'experience',
  'education',
  'achievementQuality',
  'overallScore',
] as const;

// Matches resume-parser's StructuredResume top-level keys, so missingSections
// can never reference a section name that doesn't actually exist.
export const STRUCTURED_RESUME_SECTIONS = [
  'personalInformation',
  'links',
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
  'achievements',
  'positionsOfResponsibility',
  'publications',
  'languages',
] as const;

// Score fields are required numbers, not nullable: unlike structured-resume
// extraction (where "unknown" is a valid answer), scoring is a judgment the AI
// must always produce, even for a sparse resume (e.g. a low leadership score,
// not null, when no leadership experience is present).
const detailedScoreEntrySchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
});

export type DetailedScoreEntry = z.infer<typeof detailedScoreEntrySchema>;

export const resumeAnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  categoryScores: z.object({
    projects: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    education: z.number().min(0).max(100),
    skills: z.number().min(0).max(100),
    leadership: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
  }),
  // Additive, separate from categoryScores — see DETAILED_SCORE_KEYS comment.
  detailedScores: z.object({
    atsCompatibility: detailedScoreEntrySchema,
    resumeStructure: detailedScoreEntrySchema,
    technicalSkills: detailedScoreEntrySchema,
    projects: detailedScoreEntrySchema,
    experience: detailedScoreEntrySchema,
    education: detailedScoreEntrySchema,
    achievementQuality: detailedScoreEntrySchema,
    overallScore: detailedScoreEntrySchema,
  }),
  missingSections: z.array(z.enum(STRUCTURED_RESUME_SECTIONS)),
  priorityImprovements: z.array(z.string()),
});

export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisResultSchema>;

export interface IResumeAnalysis {
  _id: string;
  resumeId: Types.ObjectId | string;
  parseId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  analysisStatus: AnalysisStatus;
  analysisVersion: number;
  promptVersion: number;
  provider: string | null;
  aiModel: string | null;
  overallScore: number | null;
  summary: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  categoryScores: ResumeAnalysisResult['categoryScores'] | null;
  detailedScores: ResumeAnalysisResult['detailedScores'] | null;
  missingSections: string[] | null;
  priorityImprovements: string[] | null;
  analysisStartedAt: Date | null;
  analysisCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfAnalysisId: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyzeResumeDTO {
  resumeId: string;
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
