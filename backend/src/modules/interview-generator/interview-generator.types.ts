import { Types } from 'mongoose';
import { z } from 'zod';
import { GENERATION_STATUS } from './interview-generator.constants';

export type GenerationStatus = (typeof GENERATION_STATUS)[keyof typeof GENERATION_STATUS];

export const QUESTION_CATEGORY_VALUES = [
  'TECHNICAL_SKILLS',
  'PROJECTS',
  'EXPERIENCE',
  'EDUCATION',
  'LEADERSHIP',
  'BEHAVIORAL',
  'PROBLEM_SOLVING',
  'COMMUNICATION',
] as const;

export const DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD'] as const;

// relatedSkill is nullable: not every question (e.g. a behavioral or
// communication question) maps back to a specific resume skill.
const interviewQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(QUESTION_CATEGORY_VALUES),
  difficulty: z.enum(DIFFICULTY_VALUES),
  reason: z.string(),
  relatedSkill: z.string().nullable(),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

export const interviewGenerationResultSchema = z.object({
  overallDifficulty: z.enum(DIFFICULTY_VALUES),
  estimatedInterviewDuration: z.number().min(0),
  technicalQuestions: z.array(interviewQuestionSchema),
  behavioralQuestions: z.array(interviewQuestionSchema),
  projectQuestions: z.array(interviewQuestionSchema),
  experienceQuestions: z.array(interviewQuestionSchema),
  followUpQuestions: z.array(interviewQuestionSchema),
});

export type InterviewGenerationResult = z.infer<typeof interviewGenerationResultSchema>;

export interface IInterviewGeneration {
  _id: string;
  resumeId: Types.ObjectId | string;
  parseId: Types.ObjectId | string;
  jobDescriptionAnalysisId: Types.ObjectId | string | null;
  userId: Types.ObjectId | string;
  generationStatus: GenerationStatus;
  generationVersion: number;
  promptVersion: number;
  provider: string | null;
  aiModel: string | null;
  questions: InterviewGenerationResult | null;
  analysisStartedAt: Date | null;
  analysisCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfGenerationId: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateInterviewDTO {
  resumeId: string;
}

export interface GenerationStatusSummary {
  resumeId: string;
  parseId: string;
  jobDescriptionAnalysisId: string | null;
  generationStatus: GenerationStatus;
  generationVersion: number;
  promptVersion: number;
  analysisStartedAt: Date | null;
  analysisCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
}
