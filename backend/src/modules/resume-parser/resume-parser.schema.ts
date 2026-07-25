import { Document, Schema, Types, model } from 'mongoose';
import { PARSING_STATUS, RESUME_PARSER_CONSTANTS } from './resume-parser.constants';
import { StructuredResume } from './resume-parser.structuredResume';
import { ParsingStatus } from './resume-parser.types';

export interface IResumeParseDocument extends Document {
  resumeId: Types.ObjectId;
  processingId: Types.ObjectId;
  userId: Types.ObjectId;
  structuredResume: StructuredResume | null;
  parsingStatus: ParsingStatus;
  parsingVersion: number;
  promptVersion: number;
  aiModel: string | null;
  provider: string | null;
  parsingStartedAt: Date | null;
  parsingCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfParseId: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const nullableStringField = { type: String, default: null };

const structuredResumeSchemaDef = new Schema<StructuredResume>(
  {
    summary: nullableStringField,
    personalInformation: {
      type: new Schema(
        {
          fullName: nullableStringField,
          email: nullableStringField,
          phone: nullableStringField,
          location: nullableStringField,
        },
        { _id: false }
      ),
      default: null,
    },
    links: {
      type: [new Schema({ label: nullableStringField, url: { type: String, required: true } }, { _id: false })],
      default: null,
    },
    education: {
      type: [
        new Schema(
          {
            institution: nullableStringField,
            degree: nullableStringField,
            fieldOfStudy: nullableStringField,
            startDate: nullableStringField,
            endDate: nullableStringField,
          },
          { _id: false }
        ),
      ],
      default: null,
    },
    experience: {
      type: [
        new Schema(
          {
            company: nullableStringField,
            title: nullableStringField,
            startDate: nullableStringField,
            endDate: nullableStringField,
            description: nullableStringField,
          },
          { _id: false }
        ),
      ],
      default: null,
    },
    projects: {
      type: [
        new Schema(
          {
            name: nullableStringField,
            description: nullableStringField,
            technologies: { type: [String], default: null },
          },
          { _id: false }
        ),
      ],
      default: null,
    },
    skills: { type: [String], default: null },
    certifications: {
      type: [
        new Schema(
          { name: nullableStringField, issuer: nullableStringField, date: nullableStringField },
          { _id: false }
        ),
      ],
      default: null,
    },
    achievements: { type: [String], default: null },
    positionsOfResponsibility: {
      type: [
        new Schema(
          { title: nullableStringField, organization: nullableStringField, description: nullableStringField },
          { _id: false }
        ),
      ],
      default: null,
    },
    publications: {
      type: [
        new Schema(
          { title: nullableStringField, publisher: nullableStringField, date: nullableStringField },
          { _id: false }
        ),
      ],
      default: null,
    },
    languages: { type: [String], default: null },
  },
  { _id: false }
);

const resumeParseSchema = new Schema<IResumeParseDocument>(
  {
    // Deliberately NOT unique on resumeId or processingId: historical parses must
    // never be overwritten, and future reparsing/versioning means multiple rows
    // per resume (and even per processingId, via /reparse) must be possible
    // without a schema migration. The service layer decides which row is
    // authoritative ("latest by createdAt"), not a DB constraint.
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    processingId: { type: Schema.Types.ObjectId, ref: 'ResumeProcessing', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    structuredResume: { type: structuredResumeSchemaDef, default: null },
    parsingStatus: {
      type: String,
      enum: Object.values(PARSING_STATUS),
      required: true,
      default: PARSING_STATUS.PENDING,
      index: true,
    },
    parsingVersion: {
      type: Number,
      required: true,
      default: RESUME_PARSER_CONSTANTS.CURRENT_PARSING_VERSION,
    },
    promptVersion: {
      type: Number,
      required: true,
      default: RESUME_PARSER_CONSTANTS.CURRENT_PROMPT_VERSION,
    },
    aiModel: { type: String, default: null },
    provider: { type: String, default: null },
    parsingStartedAt: { type: Date, default: null },
    parsingCompletedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, required: true, default: 0 },
    duplicateOfParseId: { type: Schema.Types.ObjectId, ref: 'ResumeParse', default: null },
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

resumeParseSchema.index({ resumeId: 1, createdAt: -1 });
resumeParseSchema.index({ processingId: 1, createdAt: -1 });

export const ResumeParseModel = model<IResumeParseDocument>('ResumeParse', resumeParseSchema);
