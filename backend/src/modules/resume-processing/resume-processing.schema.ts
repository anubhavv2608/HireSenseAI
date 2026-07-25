import { Document, Schema, Types, model } from 'mongoose';
import { PROCESSING_STATUS, RESUME_PROCESSING_CONSTANTS } from './resume-processing.constants';
import { PdfMetadataSnapshot, ProcessingStatus } from './resume-processing.types';

export interface IResumeProcessingDocument extends Document {
  resumeId: Types.ObjectId;
  userId: Types.ObjectId;
  contentHash: string | null;
  normalizedText: string;
  processingStatus: ProcessingStatus;
  processingVersion: number;
  processingStartedAt: Date | null;
  processingCompletedAt: Date | null;
  lastProcessedAt: Date | null;
  extractedCharacterCount: number | null;
  extractedWordCount: number | null;
  processingDuration: number | null;
  pdfMetadata: PdfMetadataSnapshot | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfProcessingId: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pdfMetadataSchema = new Schema<PdfMetadataSnapshot>(
  {
    pages: { type: Number, required: true },
    characterCount: { type: Number, required: true },
    wordCount: { type: Number, required: true },
    durationMs: { type: Number, required: true },
    pdfVersion: { type: String },
  },
  { _id: false }
);

const resumeProcessingSchema = new Schema<IResumeProcessingDocument>(
  {
    // Deliberately NOT unique: schema must allow multiple processing attempts per
    // resume in the future (parser upgrades, OCR re-runs, retry history) without a
    // migration. The service layer currently enforces "latest row is authoritative".
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentHash: { type: String, default: null, index: true },
    normalizedText: { type: String, default: '' },
    processingStatus: {
      type: String,
      enum: Object.values(PROCESSING_STATUS),
      required: true,
      default: PROCESSING_STATUS.PENDING,
      index: true,
    },
    processingVersion: {
      type: Number,
      required: true,
      default: RESUME_PROCESSING_CONSTANTS.CURRENT_PROCESSING_VERSION,
    },
    processingStartedAt: { type: Date, default: null },
    processingCompletedAt: { type: Date, default: null },
    lastProcessedAt: { type: Date, default: null },
    extractedCharacterCount: { type: Number, default: null },
    extractedWordCount: { type: Number, default: null },
    processingDuration: { type: Number, default: null },
    pdfMetadata: { type: pdfMetadataSchema, default: null },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, required: true, default: 0 },
    duplicateOfProcessingId: { type: Schema.Types.ObjectId, ref: 'ResumeProcessing', default: null },
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

resumeProcessingSchema.index({ resumeId: 1, createdAt: -1 });

export const ResumeProcessingModel = model<IResumeProcessingDocument>(
  'ResumeProcessing',
  resumeProcessingSchema
);
