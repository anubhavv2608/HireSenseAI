import { createHash } from 'crypto';
import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { IResumeDocument } from '../resume/resume.schema';
import { logger } from '../../shared/config/logger';
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from '../../shared/errors/ApiError';
import { PdfExtractionService } from '../../shared/pdf/services/PdfExtractionService';
import { StorageService } from '../../shared/storage/services/StorageService';
import { PROCESSING_STATUS, RESUME_PROCESSING_CONSTANTS, RESUME_PROCESSING_MESSAGES } from './resume-processing.constants';
import { ResumeProcessingRepository } from './resume-processing.repository';
import { IResumeProcessingDocument } from './resume-processing.schema';
import { PdfMetadataSnapshot, ProcessingStatusSummary } from './resume-processing.types';

export class ResumeProcessingService {
  private resumeRepository: ResumeRepository;
  private repository: ResumeProcessingRepository;
  private storageService: StorageService;
  private pdfExtractionService: PdfExtractionService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.repository = new ResumeProcessingRepository();
    this.storageService = new StorageService();
    this.pdfExtractionService = new PdfExtractionService();
  }

  async processResume(
    userId: string,
    resumeId: string,
    correlationId?: string
  ): Promise<IResumeProcessingDocument> {
    const resume = await this.resumeRepository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(RESUME_PROCESSING_MESSAGES.RESUME_NOT_FOUND);
    }
    if (!resume.isActive) {
      throw new BadRequestError(RESUME_PROCESSING_MESSAGES.RESUME_NOT_ACTIVE);
    }

    const existing = await this.repository.findLatestByResumeId(resumeId, userId);

    if (existing?.processingStatus === PROCESSING_STATUS.PROCESSING) {
      throw new ConflictError(RESUME_PROCESSING_MESSAGES.ALREADY_PROCESSING);
    }

    if (
      existing &&
      (existing.processingStatus === PROCESSING_STATUS.COMPLETED ||
        existing.processingStatus === PROCESSING_STATUS.SKIPPED_DUPLICATE)
    ) {
      logger.info(
        `[ResumeProcessing] Already ${existing.processingStatus}, skipping re-processing [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      return existing;
    }

    const retryCount = existing && existing.processingStatus === PROCESSING_STATUS.FAILED ? existing.retryCount + 1 : 0;
    const base = existing || (await this.repository.createPending(resumeId, userId));
    const record = await this.repository.markProcessingStarted(base._id as Types.ObjectId, retryCount);

    if (!record) {
      throw new InternalServerError(RESUME_PROCESSING_MESSAGES.PROCESSING_FAILED);
    }

    logger.info(`[ResumeProcessing] Processing started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);

    return this.runExtractionPipeline(record, resume, userId, correlationId);
  }

  private async runExtractionPipeline(
    record: IResumeProcessingDocument,
    resume: IResumeDocument,
    userId: string,
    correlationId?: string
  ): Promise<IResumeProcessingDocument> {
    const resumeId = resume._id.toString();
    const startedAt = Date.now();

    try {
      let buffer: Buffer;
      try {
        buffer = await this.storageService.downloadFile(resume.storagePublicId, {
          resourceType: RESUME_PROCESSING_CONSTANTS.STORAGE_RESOURCE_TYPE,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new NotFoundError(RESUME_PROCESSING_MESSAGES.STORAGE_FILE_MISSING);
        }
        throw error;
      }

      const extraction = await this.pdfExtractionService.extract(buffer, { correlationId });
      logger.info(
        `[ResumeProcessing] Extraction completed - ${extraction.metadata.pages} pages [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );

      const contentHash = createHash('sha256').update(extraction.text).digest('hex');
      logger.info(
        `[ResumeProcessing] Hash generated [ResumeID: ${resumeId}] [Hash: ${contentHash}] [CorrelationID: ${correlationId}]`
      );

      const pdfMetadata: PdfMetadataSnapshot = {
        pages: extraction.metadata.pages,
        characterCount: extraction.metadata.characterCount,
        wordCount: extraction.metadata.wordCount,
        durationMs: extraction.metadata.durationMs,
        pdfVersion: extraction.metadata.version,
      };

      const processingDuration = Date.now() - startedAt;

      const duplicate = await this.repository.findCompletedByContentHash(contentHash, userId, resumeId);

      if (duplicate) {
        logger.info(
          `[ResumeProcessing] Duplicate content detected, reusing processing record [ResumeID: ${resumeId}] [DuplicateOf: ${duplicate._id}] [CorrelationID: ${correlationId}]`
        );
        const updated = await this.repository.markSkippedDuplicate(record._id as Types.ObjectId, {
          contentHash,
          normalizedText: extraction.text,
          pdfMetadata,
          extractedCharacterCount: extraction.metadata.characterCount,
          extractedWordCount: extraction.metadata.wordCount,
          processingDuration,
          duplicateOfProcessingId: (duplicate._id as Types.ObjectId).toString(),
        });
        if (!updated) {
          throw new InternalServerError(RESUME_PROCESSING_MESSAGES.PROCESSING_FAILED);
        }
        return updated;
      }

      const updated = await this.repository.markCompleted(record._id as Types.ObjectId, {
        contentHash,
        normalizedText: extraction.text,
        pdfMetadata,
        extractedCharacterCount: extraction.metadata.characterCount,
        extractedWordCount: extraction.metadata.wordCount,
        processingDuration,
      });

      if (!updated) {
        throw new InternalServerError(RESUME_PROCESSING_MESSAGES.PROCESSING_FAILED);
      }

      logger.info(
        `[ResumeProcessing] Processing completed [ResumeID: ${resumeId}] - ${processingDuration}ms [CorrelationID: ${correlationId}]`
      );
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : RESUME_PROCESSING_MESSAGES.PROCESSING_FAILED;
      logger.error(
        `[ResumeProcessing] Processing failed [ResumeID: ${resumeId}] - ${message} [CorrelationID: ${correlationId}]`
      );
      await this.repository.markFailed(record._id as Types.ObjectId, message);

      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError(RESUME_PROCESSING_MESSAGES.PROCESSING_FAILED);
    }
  }

  async getStatus(userId: string, resumeId: string): Promise<ProcessingStatusSummary> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_PROCESSING_MESSAGES.PROCESSING_NOT_FOUND);
    }

    return {
      resumeId: record.resumeId.toString(),
      processingStatus: record.processingStatus,
      processingVersion: record.processingVersion,
      processingStartedAt: record.processingStartedAt,
      processingCompletedAt: record.processingCompletedAt,
      lastProcessedAt: record.lastProcessedAt,
      errorMessage: record.errorMessage,
      retryCount: record.retryCount,
    };
  }

  async getRecord(userId: string, resumeId: string): Promise<IResumeProcessingDocument> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_PROCESSING_MESSAGES.PROCESSING_NOT_FOUND);
    }
    return record;
  }
}
