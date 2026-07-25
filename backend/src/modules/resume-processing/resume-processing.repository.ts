import { Types } from 'mongoose';
import { PROCESSING_STATUS, RESUME_PROCESSING_CONSTANTS } from './resume-processing.constants';
import { IResumeProcessingDocument, ResumeProcessingModel } from './resume-processing.schema';
import { PdfMetadataSnapshot, ProcessingStatus } from './resume-processing.types';

export interface CompletedProcessingUpdate {
  contentHash: string;
  normalizedText: string;
  pdfMetadata: PdfMetadataSnapshot;
  extractedCharacterCount: number;
  extractedWordCount: number;
  processingDuration: number;
}

export class ResumeProcessingRepository {
  async findLatestByResumeId(resumeId: string, userId: string): Promise<IResumeProcessingDocument | null> {
    return ResumeProcessingModel.findOne({ resumeId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findCompletedByContentHash(
    contentHash: string,
    userId: string,
    excludeResumeId: string
  ): Promise<IResumeProcessingDocument | null> {
    return ResumeProcessingModel.findOne({
      contentHash,
      userId,
      resumeId: { $ne: excludeResumeId },
      processingStatus: PROCESSING_STATUS.COMPLETED,
      isDeleted: false,
    });
  }

  async createPending(resumeId: string, userId: string): Promise<IResumeProcessingDocument> {
    return ResumeProcessingModel.create({
      resumeId,
      userId,
      processingStatus: PROCESSING_STATUS.PENDING,
      processingVersion: RESUME_PROCESSING_CONSTANTS.CURRENT_PROCESSING_VERSION,
      retryCount: 0,
    });
  }

  async markProcessingStarted(
    id: Types.ObjectId | string,
    retryCount: number
  ): Promise<IResumeProcessingDocument | null> {
    return ResumeProcessingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          processingStatus: PROCESSING_STATUS.PROCESSING,
          processingStartedAt: new Date(),
          errorMessage: null,
          retryCount,
        },
      },
      { new: true }
    );
  }

  async markCompleted(
    id: Types.ObjectId | string,
    update: CompletedProcessingUpdate
  ): Promise<IResumeProcessingDocument | null> {
    const now = new Date();
    return ResumeProcessingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          processingStatus: PROCESSING_STATUS.COMPLETED,
          contentHash: update.contentHash,
          normalizedText: update.normalizedText,
          pdfMetadata: update.pdfMetadata,
          extractedCharacterCount: update.extractedCharacterCount,
          extractedWordCount: update.extractedWordCount,
          processingDuration: update.processingDuration,
          processingCompletedAt: now,
          lastProcessedAt: now,
        },
      },
      { new: true }
    );
  }

  async markSkippedDuplicate(
    id: Types.ObjectId | string,
    update: CompletedProcessingUpdate & { duplicateOfProcessingId: string }
  ): Promise<IResumeProcessingDocument | null> {
    const now = new Date();
    return ResumeProcessingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          processingStatus: PROCESSING_STATUS.SKIPPED_DUPLICATE,
          contentHash: update.contentHash,
          normalizedText: update.normalizedText,
          pdfMetadata: update.pdfMetadata,
          extractedCharacterCount: update.extractedCharacterCount,
          extractedWordCount: update.extractedWordCount,
          processingDuration: update.processingDuration,
          duplicateOfProcessingId: update.duplicateOfProcessingId,
          processingCompletedAt: now,
          lastProcessedAt: now,
        },
      },
      { new: true }
    );
  }

  async markFailed(id: Types.ObjectId | string, errorMessage: string): Promise<IResumeProcessingDocument | null> {
    return ResumeProcessingModel.findByIdAndUpdate(
      id,
      {
        $set: {
          processingStatus: PROCESSING_STATUS.FAILED,
          errorMessage,
          lastProcessedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async countByStatus(status: ProcessingStatus): Promise<number> {
    return ResumeProcessingModel.countDocuments({ processingStatus: status, isDeleted: false });
  }

  async findLatestByResumeIds(resumeIds: string[]): Promise<Map<string, IResumeProcessingDocument>> {
    const docs = await ResumeProcessingModel.find({ resumeId: { $in: resumeIds }, isDeleted: false }).sort({
      createdAt: -1,
    });
    const latestByResumeId = new Map<string, IResumeProcessingDocument>();
    for (const doc of docs) {
      const key = doc.resumeId.toString();
      if (!latestByResumeId.has(key)) {
        latestByResumeId.set(key, doc);
      }
    }
    return latestByResumeId;
  }
}
