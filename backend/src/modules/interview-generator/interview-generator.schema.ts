import { Document, Schema, Types, model } from 'mongoose';
import { GENERATION_STATUS, INTERVIEW_GENERATOR_CONSTANTS } from './interview-generator.constants';
import {
  DIFFICULTY_VALUES,
  GenerationStatus,
  InterviewGenerationResult,
  QUESTION_CATEGORY_VALUES,
} from './interview-generator.types';

export interface IInterviewGenerationDocument extends Document {
  resumeId: Types.ObjectId;
  parseId: Types.ObjectId;
  jobDescriptionAnalysisId: Types.ObjectId | null;
  userId: Types.ObjectId;
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
  duplicateOfGenerationId: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const interviewQuestionSchemaDef = new Schema(
  {
    question: { type: String, required: true },
    category: { type: String, enum: QUESTION_CATEGORY_VALUES, required: true },
    difficulty: { type: String, enum: DIFFICULTY_VALUES, required: true },
    reason: { type: String, required: true },
    relatedSkill: { type: String, default: null },
  },
  { _id: false }
);

const questionsSchemaDef = new Schema<InterviewGenerationResult>(
  {
    overallDifficulty: { type: String, enum: DIFFICULTY_VALUES, required: true },
    estimatedInterviewDuration: { type: Number, required: true },
    technicalQuestions: { type: [interviewQuestionSchemaDef], required: true },
    behavioralQuestions: { type: [interviewQuestionSchemaDef], required: true },
    projectQuestions: { type: [interviewQuestionSchemaDef], required: true },
    experienceQuestions: { type: [interviewQuestionSchemaDef], required: true },
    followUpQuestions: { type: [interviewQuestionSchemaDef], required: true },
  },
  { _id: false }
);

const interviewGenerationSchema = new Schema<IInterviewGenerationDocument>(
  {
    // Deliberately NOT unique on resumeId/parseId/jobDescriptionAnalysisId:
    // historical generations must never be overwritten, and a resume can be
    // regenerated against many different (or no) job descriptions over time.
    // The service layer decides which row is authoritative ("latest by
    // createdAt"), not a DB constraint.
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    parseId: { type: Schema.Types.ObjectId, ref: 'ResumeParse', required: true, index: true },
    jobDescriptionAnalysisId: {
      type: Schema.Types.ObjectId,
      ref: 'JobDescriptionAnalysis',
      default: null,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    generationStatus: {
      type: String,
      enum: Object.values(GENERATION_STATUS),
      required: true,
      default: GENERATION_STATUS.PENDING,
      index: true,
    },
    generationVersion: {
      type: Number,
      required: true,
      default: INTERVIEW_GENERATOR_CONSTANTS.CURRENT_GENERATION_VERSION,
    },
    promptVersion: {
      type: Number,
      required: true,
      default: INTERVIEW_GENERATOR_CONSTANTS.CURRENT_PROMPT_VERSION,
    },
    provider: { type: String, default: null },
    aiModel: { type: String, default: null },
    questions: { type: questionsSchemaDef, default: null },
    analysisStartedAt: { type: Date, default: null },
    analysisCompletedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, required: true, default: 0 },
    duplicateOfGenerationId: { type: Schema.Types.ObjectId, ref: 'InterviewGeneration', default: null },
    isDeleted: { type: Boolean, default: false, select: false, index: true },
    deletedAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

interviewGenerationSchema.index({ resumeId: 1, createdAt: -1 });
interviewGenerationSchema.index({ parseId: 1, createdAt: -1 });
interviewGenerationSchema.index({ parseId: 1, jobDescriptionAnalysisId: 1, createdAt: -1 });

export const InterviewGenerationModel = model<IInterviewGenerationDocument>(
  'InterviewGeneration',
  interviewGenerationSchema
);
