import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { IResumeDocument } from '../resume/resume.schema';
import { ANALYSIS_STATUS as JD_ANALYSIS_STATUS } from '../job-description-analysis/job-description-analysis.constants';
import { JobDescriptionAnalysisRepository } from '../job-description-analysis/job-description-analysis.repository';
import { IJobDescriptionAnalysisDocument } from '../job-description-analysis/job-description-analysis.schema';
import { PARSING_STATUS } from '../resume-parser/resume-parser.constants';
import { ResumeParseRepository } from '../resume-parser/resume-parser.repository';
import { IResumeParseDocument } from '../resume-parser/resume-parser.schema';
import { AIService } from '../../shared/ai';
import { logger } from '../../shared/config/logger';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/ApiError';
import { GENERATION_STATUS, INTERVIEW_GENERATOR_MESSAGES } from './interview-generator.constants';
import { buildInterviewGenerationPrompt, interviewGenerationResponseSchema } from './interview-generator.prompt';
import { InterviewGenerationRepository } from './interview-generator.repository';
import { IInterviewGenerationDocument } from './interview-generator.schema';
import { GenerationStatusSummary, interviewGenerationResultSchema } from './interview-generator.types';

const PARSEABLE_STATUSES: string[] = [PARSING_STATUS.COMPLETED, PARSING_STATUS.SKIPPED_ALREADY_PARSED];
const USABLE_JD_ANALYSIS_STATUSES: string[] = [
  JD_ANALYSIS_STATUS.COMPLETED,
  JD_ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED,
];

export class InterviewGeneratorService {
  private resumeRepository: ResumeRepository;
  private resumeParseRepository: ResumeParseRepository;
  private jobDescriptionAnalysisRepository: JobDescriptionAnalysisRepository;
  private repository: InterviewGenerationRepository;
  private aiService: AIService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeParseRepository = new ResumeParseRepository();
    this.jobDescriptionAnalysisRepository = new JobDescriptionAnalysisRepository();
    this.repository = new InterviewGenerationRepository();
    this.aiService = new AIService();
  }

  async generateQuestions(
    userId: string,
    resumeId: string,
    correlationId?: string,
    options: { force?: boolean } = {}
  ): Promise<IInterviewGenerationDocument> {
    const force = options.force ?? false;

    const resume = await this.resumeRepository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(INTERVIEW_GENERATOR_MESSAGES.RESUME_NOT_FOUND);
    }
    if (!resume.isActive) {
      throw new BadRequestError(INTERVIEW_GENERATOR_MESSAGES.RESUME_NOT_ACTIVE);
    }

    const parse = await this.resumeParseRepository.findLatestByResumeId(resumeId, userId);
    if (!parse || !PARSEABLE_STATUSES.includes(parse.parsingStatus) || !parse.structuredResume) {
      throw new BadRequestError(INTERVIEW_GENERATOR_MESSAGES.PARSE_NOT_COMPLETED);
    }

    const jdAnalysisCandidate = await this.jobDescriptionAnalysisRepository.findLatestByParseId(
      parse._id as Types.ObjectId,
      userId
    );
    const jdAnalysis =
      jdAnalysisCandidate && USABLE_JD_ANALYSIS_STATUSES.includes(jdAnalysisCandidate.analysisStatus)
        ? jdAnalysisCandidate
        : null;
    const jobDescriptionAnalysisId = jdAnalysis ? (jdAnalysis._id as Types.ObjectId) : null;

    const existing = await this.repository.findLatestByParseIdAndJdId(
      parse._id as Types.ObjectId,
      jobDescriptionAnalysisId,
      userId
    );

    if (existing?.generationStatus === GENERATION_STATUS.GENERATING) {
      throw new ConflictError(INTERVIEW_GENERATOR_MESSAGES.ALREADY_GENERATING);
    }

    // Once a call has been skipped, the LATEST record for this (parseId,
    // jobDescriptionAnalysisId) pair is itself a SKIPPED_ALREADY_GENERATED
    // row, not COMPLETED - so a third call must also recognize
    // SKIPPED_ALREADY_GENERATED as "already have a usable result," or
    // idempotency would only hold for exactly two calls.
    if (
      !force &&
      existing &&
      (existing.generationStatus === GENERATION_STATUS.COMPLETED ||
        existing.generationStatus === GENERATION_STATUS.SKIPPED_ALREADY_GENERATED)
    ) {
      return this.skipAlreadyGenerated(existing, resumeId, parse, jobDescriptionAnalysisId, userId, correlationId);
    }

    const retryCount = existing && existing.generationStatus === GENERATION_STATUS.FAILED ? existing.retryCount + 1 : 0;
    const base =
      force || !existing
        ? await this.repository.createPending(resumeId, parse._id as Types.ObjectId, jobDescriptionAnalysisId, userId)
        : existing;
    const record = await this.repository.markGenerationStarted(base._id as Types.ObjectId, retryCount);

    if (!record) {
      throw new InternalServerError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED);
    }

    logger.info(
      `[InterviewGenerator] Generation started [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    return this.runGenerationPipeline(record, resume, parse, jdAnalysis, correlationId);
  }

  async regenerateQuestions(
    userId: string,
    resumeId: string,
    correlationId?: string
  ): Promise<IInterviewGenerationDocument> {
    return this.generateQuestions(userId, resumeId, correlationId, { force: true });
  }

  private async skipAlreadyGenerated(
    existing: IInterviewGenerationDocument,
    resumeId: string,
    parse: IResumeParseDocument,
    jobDescriptionAnalysisId: Types.ObjectId | null,
    userId: string,
    correlationId?: string
  ): Promise<IInterviewGenerationDocument> {
    logger.info(
      `[InterviewGenerator] Already generated, skipping [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    if (!existing.questions || !existing.aiModel || !existing.provider) {
      throw new InternalServerError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED);
    }

    const skipRecord = await this.repository.createPending(
      resumeId,
      parse._id as Types.ObjectId,
      jobDescriptionAnalysisId,
      userId
    );
    const skipped = await this.repository.markSkippedAlreadyGenerated(skipRecord._id as Types.ObjectId, {
      questions: existing.questions,
      aiModel: existing.aiModel,
      provider: existing.provider,
      // Flatten the chain: if `existing` is itself a skip record, point at
      // the true original COMPLETED generation it already references, not at
      // the intermediate skip - keeps duplicateOfGenerationId always one hop away.
      duplicateOfGenerationId: (existing.duplicateOfGenerationId
        ? existing.duplicateOfGenerationId
        : (existing._id as Types.ObjectId)
      ).toString(),
    });

    if (!skipped) {
      throw new InternalServerError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED);
    }

    return skipped;
  }

  private async runGenerationPipeline(
    record: IInterviewGenerationDocument,
    resume: IResumeDocument,
    parse: IResumeParseDocument,
    jdAnalysis: IJobDescriptionAnalysisDocument | null,
    correlationId?: string
  ): Promise<IInterviewGenerationDocument> {
    const resumeId = resume._id.toString();
    const startedAt = Date.now();

    try {
      const prompt = buildInterviewGenerationPrompt(parse.structuredResume!, jdAnalysis);

      logger.info(
        `[InterviewGenerator] AI request started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const result = await this.aiService.generateStructuredOutput(prompt, interviewGenerationResponseSchema);

      logger.info(
        `[InterviewGenerator] Validation started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const parsed = interviewGenerationResultSchema.safeParse(result.data);
      if (!parsed.success) {
        throw new ValidationError(INTERVIEW_GENERATOR_MESSAGES.VALIDATION_FAILED);
      }

      const updated = await this.repository.markCompleted(record._id as Types.ObjectId, {
        questions: parsed.data,
        aiModel: result.model,
        provider: result.provider,
      });

      if (!updated) {
        throw new InternalServerError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED);
      }

      const durationMs = Date.now() - startedAt;
      logger.info(
        `[InterviewGenerator] Persistence completed [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      logger.info(
        `[InterviewGenerator] Completed [ResumeID: ${resumeId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED;
      logger.error(
        `[InterviewGenerator] Generation failed [ResumeID: ${resumeId}] - ${message} [CorrelationID: ${correlationId}]`
      );
      await this.repository.markFailed(record._id as Types.ObjectId, message);

      if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new InternalServerError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_FAILED);
    }
  }

  async getStatus(userId: string, resumeId: string): Promise<GenerationStatusSummary> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_NOT_FOUND);
    }

    return {
      resumeId: record.resumeId.toString(),
      parseId: record.parseId.toString(),
      jobDescriptionAnalysisId: record.jobDescriptionAnalysisId ? record.jobDescriptionAnalysisId.toString() : null,
      generationStatus: record.generationStatus,
      generationVersion: record.generationVersion,
      promptVersion: record.promptVersion,
      analysisStartedAt: record.analysisStartedAt,
      analysisCompletedAt: record.analysisCompletedAt,
      lastAttemptedAt: record.lastAttemptedAt,
      errorMessage: record.errorMessage,
      retryCount: record.retryCount,
    };
  }

  async getRecord(userId: string, resumeId: string): Promise<IInterviewGenerationDocument> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(INTERVIEW_GENERATOR_MESSAGES.GENERATION_NOT_FOUND);
    }
    return record;
  }
}
