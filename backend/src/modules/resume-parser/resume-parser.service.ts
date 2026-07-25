import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { IResumeDocument } from '../resume/resume.schema';
import { PROCESSING_STATUS } from '../resume-processing/resume-processing.constants';
import { ResumeProcessingRepository } from '../resume-processing/resume-processing.repository';
import { IResumeProcessingDocument } from '../resume-processing/resume-processing.schema';
import { AIService } from '../../shared/ai';
import { logger } from '../../shared/config/logger';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/ApiError';
import { PARSING_STATUS, RESUME_PARSER_CONSTANTS, RESUME_PARSER_MESSAGES } from './resume-parser.constants';
import { buildResumeParsingPrompt } from './resume-parser.prompt';
import { ResumeParseRepository } from './resume-parser.repository';
import { IResumeParseDocument } from './resume-parser.schema';
import { structuredResumeResponseSchema, structuredResumeSchema } from './resume-parser.structuredResume';
import { ParsingStatusSummary } from './resume-parser.types';

const PARSEABLE_PROCESSING_STATUSES: string[] = [PROCESSING_STATUS.COMPLETED, PROCESSING_STATUS.SKIPPED_DUPLICATE];

export class ResumeParserService {
  private resumeRepository: ResumeRepository;
  private resumeProcessingRepository: ResumeProcessingRepository;
  private repository: ResumeParseRepository;
  private aiService: AIService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeProcessingRepository = new ResumeProcessingRepository();
    this.repository = new ResumeParseRepository();
    this.aiService = new AIService();
  }

  async parseResume(
    userId: string,
    resumeId: string,
    correlationId?: string,
    options: { force?: boolean } = {}
  ): Promise<IResumeParseDocument> {
    const force = options.force ?? false;

    const resume = await this.resumeRepository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(RESUME_PARSER_MESSAGES.RESUME_NOT_FOUND);
    }
    if (!resume.isActive) {
      throw new BadRequestError(RESUME_PARSER_MESSAGES.RESUME_NOT_ACTIVE);
    }

    const processing = await this.resumeProcessingRepository.findLatestByResumeId(resumeId, userId);
    if (!processing || !PARSEABLE_PROCESSING_STATUSES.includes(processing.processingStatus)) {
      throw new BadRequestError(RESUME_PARSER_MESSAGES.PROCESSING_NOT_COMPLETED);
    }
    if (!processing.normalizedText || processing.normalizedText.trim().length === 0) {
      throw new BadRequestError(RESUME_PARSER_MESSAGES.MISSING_NORMALIZED_TEXT);
    }

    const existing = await this.repository.findLatestByProcessingId(
      processing._id as Types.ObjectId,
      userId
    );

    if (existing?.parsingStatus === PARSING_STATUS.PARSING) {
      throw new ConflictError(RESUME_PARSER_MESSAGES.ALREADY_PARSING);
    }

    // Once a call has been skipped, the LATEST record for this processingId is
    // itself a SKIPPED_ALREADY_PARSED row, not COMPLETED - so a third call must
    // also recognize SKIPPED_ALREADY_PARSED as "already have a usable result,"
    // or idempotency would only hold for exactly two calls.
    if (
      !force &&
      existing &&
      (existing.parsingStatus === PARSING_STATUS.COMPLETED ||
        existing.parsingStatus === PARSING_STATUS.SKIPPED_ALREADY_PARSED)
    ) {
      return this.skipAlreadyParsed(existing, resumeId, processing, userId, correlationId);
    }

    const retryCount = existing && existing.parsingStatus === PARSING_STATUS.FAILED ? existing.retryCount + 1 : 0;
    const base =
      force || !existing
        ? await this.repository.createPending(resumeId, processing._id as Types.ObjectId, userId)
        : existing;
    const record = await this.repository.markParsingStarted(base._id as Types.ObjectId, retryCount);

    if (!record) {
      throw new InternalServerError(RESUME_PARSER_MESSAGES.PARSING_FAILED);
    }

    logger.info(
      `[ResumeParser] Parsing started [ResumeID: ${resumeId}] [ProcessingID: ${processing._id}] [CorrelationID: ${correlationId}]`
    );

    return this.runParsingPipeline(record, resume, processing, correlationId);
  }

  async reparseResume(userId: string, resumeId: string, correlationId?: string): Promise<IResumeParseDocument> {
    return this.parseResume(userId, resumeId, correlationId, { force: true });
  }

  private async skipAlreadyParsed(
    existing: IResumeParseDocument,
    resumeId: string,
    processing: IResumeProcessingDocument,
    userId: string,
    correlationId?: string
  ): Promise<IResumeParseDocument> {
    logger.info(
      `[ResumeParser] Already parsed, skipping [ResumeID: ${resumeId}] [ProcessingID: ${processing._id}] [CorrelationID: ${correlationId}]`
    );

    if (!existing.structuredResume || !existing.aiModel || !existing.provider) {
      throw new InternalServerError(RESUME_PARSER_MESSAGES.PARSING_FAILED);
    }

    const skipRecord = await this.repository.createPending(resumeId, processing._id as Types.ObjectId, userId);
    const skipped = await this.repository.markSkippedAlreadyParsed(skipRecord._id as Types.ObjectId, {
      structuredResume: existing.structuredResume,
      aiModel: existing.aiModel,
      provider: existing.provider,
      // Flatten the chain: if `existing` is itself a skip record, point at the
      // true original COMPLETED parse it already references, not at the
      // intermediate skip - keeps duplicateOfParseId always one hop away.
      duplicateOfParseId: (existing.duplicateOfParseId
        ? existing.duplicateOfParseId
        : (existing._id as Types.ObjectId)
      ).toString(),
    });

    if (!skipped) {
      throw new InternalServerError(RESUME_PARSER_MESSAGES.PARSING_FAILED);
    }

    return skipped;
  }

  private async runParsingPipeline(
    record: IResumeParseDocument,
    resume: IResumeDocument,
    processing: IResumeProcessingDocument,
    correlationId?: string
  ): Promise<IResumeParseDocument> {
    const resumeId = resume._id.toString();
    const startedAt = Date.now();

    try {
      const prompt = buildResumeParsingPrompt(processing.normalizedText);

      logger.info(`[ResumeParser] AI request started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      const result = await this.aiService.generateStructuredOutput(prompt, structuredResumeResponseSchema, {
        temperature: RESUME_PARSER_CONSTANTS.TEMPERATURE,
      });

      logger.info(`[ResumeParser] Validation started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      const parsed = structuredResumeSchema.safeParse(result.data);
      if (!parsed.success) {
        throw new ValidationError(RESUME_PARSER_MESSAGES.VALIDATION_FAILED);
      }

      const updated = await this.repository.markCompleted(record._id as Types.ObjectId, {
        structuredResume: parsed.data,
        aiModel: result.model,
        provider: result.provider,
      });

      if (!updated) {
        throw new InternalServerError(RESUME_PARSER_MESSAGES.PARSING_FAILED);
      }

      const durationMs = Date.now() - startedAt;
      logger.info(`[ResumeParser] Persistence completed [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      logger.info(
        `[ResumeParser] Parsing completed [ResumeID: ${resumeId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : RESUME_PARSER_MESSAGES.PARSING_FAILED;
      logger.error(
        `[ResumeParser] Parsing failed [ResumeID: ${resumeId}] - ${message} [CorrelationID: ${correlationId}]`
      );
      await this.repository.markFailed(record._id as Types.ObjectId, message);

      if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new InternalServerError(RESUME_PARSER_MESSAGES.PARSING_FAILED);
    }
  }

  async getStatus(userId: string, resumeId: string): Promise<ParsingStatusSummary> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_PARSER_MESSAGES.PARSE_NOT_FOUND);
    }

    return {
      resumeId: record.resumeId.toString(),
      processingId: record.processingId.toString(),
      parsingStatus: record.parsingStatus,
      parsingVersion: record.parsingVersion,
      promptVersion: record.promptVersion,
      parsingStartedAt: record.parsingStartedAt,
      parsingCompletedAt: record.parsingCompletedAt,
      lastAttemptedAt: record.lastAttemptedAt,
      errorMessage: record.errorMessage,
      retryCount: record.retryCount,
    };
  }

  async getRecord(userId: string, resumeId: string): Promise<IResumeParseDocument> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_PARSER_MESSAGES.PARSE_NOT_FOUND);
    }
    return record;
  }
}
