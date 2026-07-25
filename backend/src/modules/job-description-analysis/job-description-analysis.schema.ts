import { Document, Schema, Types, model } from 'mongoose';
import { ANALYSIS_STATUS, JD_ANALYSIS_CONSTANTS } from './job-description-analysis.constants';
import { AnalysisStatus, ExtractedRequirements } from './job-description-analysis.types';

export interface IJobDescriptionAnalysisDocument extends Document {
  resumeId: Types.ObjectId;
  parseId: Types.ObjectId;
  userId: Types.ObjectId;
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
  duplicateOfAnalysisId: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const extractedRequirementsSchema = new Schema<ExtractedRequirements>(
  {
    languages: { type: [String], required: true },
    frameworks: { type: [String], required: true },
    libraries: { type: [String], required: true },
    databases: { type: [String], required: true },
    responsibilities: { type: [String], required: true },
    requiredQualifications: { type: [String], required: true },
    preferredQualifications: { type: [String], required: true },
    softSkills: { type: [String], required: true },
  },
  { _id: false }
);

const jobDescriptionAnalysisSchema = new Schema<IJobDescriptionAnalysisDocument>(
  {
    // Deliberately NOT unique on resumeId or parseId: historical analyses must
    // never be overwritten, and a resume can legitimately be compared against
    // many different job descriptions over time. The service layer decides
    // which row is authoritative ("latest by createdAt"), not a DB constraint.
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    parseId: { type: Schema.Types.ObjectId, ref: 'ResumeParse', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobDescription: { type: String, required: true },
    jobDescriptionHash: { type: String, required: true, index: true },
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
      default: JD_ANALYSIS_CONSTANTS.CURRENT_ANALYSIS_VERSION,
    },
    promptVersion: {
      type: Number,
      required: true,
      default: JD_ANALYSIS_CONSTANTS.CURRENT_PROMPT_VERSION,
    },
    provider: { type: String, default: null },
    aiModel: { type: String, default: null },
    overallMatchScore: { type: Number, default: null },
    summary: { type: String, default: null },
    matchingSkills: { type: [String], default: null },
    missingSkills: { type: [String], default: null },
    matchingExperience: { type: [String], default: null },
    experienceGaps: { type: [String], default: null },
    educationMatch: { type: String, default: null },
    projectRelevance: { type: String, default: null },
    keywordCoverage: { type: Number, default: null },
    strengths: { type: [String], default: null },
    weaknesses: { type: [String], default: null },
    recommendations: { type: [String], default: null },
    hiringRecommendation: { type: String, default: null },
    priorityImprovements: { type: [String], default: null },
    extractedRequirements: { type: extractedRequirementsSchema, default: null },
    learningRoadmap: { type: [String], default: null },
    analysisStartedAt: { type: Date, default: null },
    analysisCompletedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, required: true, default: 0 },
    duplicateOfAnalysisId: { type: Schema.Types.ObjectId, ref: 'JobDescriptionAnalysis', default: null },
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

jobDescriptionAnalysisSchema.index({ resumeId: 1, createdAt: -1 });
jobDescriptionAnalysisSchema.index({ parseId: 1, createdAt: -1 });
jobDescriptionAnalysisSchema.index({ parseId: 1, jobDescriptionHash: 1, createdAt: -1 });

export const JobDescriptionAnalysisModel = model<IJobDescriptionAnalysisDocument>(
  'JobDescriptionAnalysis',
  jobDescriptionAnalysisSchema
);
