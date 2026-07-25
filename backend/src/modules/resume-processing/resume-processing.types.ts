import { Types } from 'mongoose';
import { PROCESSING_STATUS } from './resume-processing.constants';

export type ProcessingStatus = (typeof PROCESSING_STATUS)[keyof typeof PROCESSING_STATUS];

// Deliberately local and stable, not the `PdfMetadata` DTO imported from shared/pdf,
// so a future change to PdfExtractionService's return shape never forces a schema migration.
export interface PdfMetadataSnapshot {
  pages: number;
  characterCount: number;
  wordCount: number;
  durationMs: number;
  pdfVersion?: string;
}

export interface IResumeProcessing {
  _id: string;
  resumeId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
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
  duplicateOfProcessingId: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessResumeDTO {
  resumeId: string;
}

export interface ProcessingStatusSummary {
  resumeId: string;
  processingStatus: ProcessingStatus;
  processingVersion: number;
  processingStartedAt: Date | null;
  processingCompletedAt: Date | null;
  lastProcessedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
}
