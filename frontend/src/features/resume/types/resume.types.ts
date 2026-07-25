export interface Resume {
  _id: string;
  userId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  storageProvider: string;
  storagePublicId: string;
  storageUrl: string;
  version: number;
  isActive: boolean;
  uploadSource: string;
  status: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "SKIPPED_DUPLICATE";

export interface ProcessingStatusSummary {
  resumeId: string;
  processingStatus: ProcessingStatus;
  processingVersion: number;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  lastProcessedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
}

export interface PdfMetadata {
  pages: number;
  characterCount: number;
  wordCount: number;
  durationMs: number;
  pdfVersion?: string;
}

export interface ProcessingDocument extends ProcessingStatusSummary {
  contentHash: string | null;
  normalizedText: string;
  extractedCharacterCount: number | null;
  extractedWordCount: number | null;
  processingDuration: number | null;
  pdfMetadata: PdfMetadata | null;
  duplicateOfProcessingId: string | null;
  createdAt: string;
  updatedAt: string;
}
