import { Document, Schema, Types, model } from 'mongoose';
import { ANALYSIS_STATUS, RESUME_ANALYSIS_CONSTANTS } from './resume-analysis.constants';
import { AnalysisStatus, ResumeAnalysisResult } from './resume-analysis.types';

export interface IResumeAnalysisDocument extends Document {
  resumeId: Types.ObjectId;
  parseId: Types.ObjectId;
  userId: Types.ObjectId;
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
  duplicateOfAnalysisId: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const categoryScoresSchema = new Schema<ResumeAnalysisResult['categoryScores']>(
  {
    projects: { type: Number, required: true },
    experience: { type: Number, required: true },
    education: { type: Number, required: true },
    skills: { type: Number, required: true },
    leadership: { type: Number, required: true },
    completeness: { type: Number, required: true },
  },
  { _id: false }
);

const detailedScoreEntrySchema = new Schema(
  {
    score: { type: Number, required: true },
    explanation: { type: String, required: true },
    strengths: { type: [String], required: true },
    weaknesses: { type: [String], required: true },
    improvements: { type: [String], required: true },
  },
  { _id: false }
);

const detailedScoresSchema = new Schema<ResumeAnalysisResult['detailedScores']>(
  {
    atsCompatibility: { type: detailedScoreEntrySchema, required: true },
    resumeStructure: { type: detailedScoreEntrySchema, required: true },
    technicalSkills: { type: detailedScoreEntrySchema, required: true },
    projects: { type: detailedScoreEntrySchema, required: true },
    experience: { type: detailedScoreEntrySchema, required: true },
    education: { type: detailedScoreEntrySchema, required: true },
    achievementQuality: { type: detailedScoreEntrySchema, required: true },
    overallScore: { type: detailedScoreEntrySchema, required: true },
  },
  { _id: false }
);

const resumeAnalysisSchema = new Schema<IResumeAnalysisDocument>(
  {
    // Deliberately NOT unique on resumeId or parseId: historical analyses must
    // never be overwritten, and future scoring-version/prompt changes mean
    // multiple rows per resume (and even per parseId, via /reanalyze) must be
    // possible without a schema migration. The service layer decides which row
    // is authoritative ("latest by createdAt"), not a DB constraint.
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    parseId: { type: Schema.Types.ObjectId, ref: 'ResumeParse', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    analysisStatus: {
      type: String,
      enum: Object.values(ANALYSIS_STATUS),
      required: true,
      default: ANALYSIS_STATUS.PENDING,
      index: true,
    },
    analysisVersion: {
      type: Number,
      required: true,
      default: RESUME_ANALYSIS_CONSTANTS.CURRENT_ANALYSIS_VERSION,
    },
    promptVersion: {
      type: Number,
      required: true,
      default: RESUME_ANALYSIS_CONSTANTS.CURRENT_PROMPT_VERSION,
    },
    provider: { type: String, default: null },
    aiModel: { type: String, default: null },
    overallScore: { type: Number, default: null },
    summary: { type: String, default: null },
    strengths: { type: [String], default: null },
    weaknesses: { type: [String], default: null },
    recommendations: { type: [String], default: null },
    categoryScores: { type: categoryScoresSchema, default: null },
    detailedScores: { type: detailedScoresSchema, default: null },
    missingSections: { type: [String], default: null },
    priorityImprovements: { type: [String], default: null },
    analysisStartedAt: { type: Date, default: null },
    analysisCompletedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, required: true, default: 0 },
    duplicateOfAnalysisId: { type: Schema.Types.ObjectId, ref: 'ResumeAnalysis', default: null },
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

resumeAnalysisSchema.index({ resumeId: 1, createdAt: -1 });
resumeAnalysisSchema.index({ parseId: 1, createdAt: -1 });

export const ResumeAnalysisModel = model<IResumeAnalysisDocument>('ResumeAnalysis', resumeAnalysisSchema);
