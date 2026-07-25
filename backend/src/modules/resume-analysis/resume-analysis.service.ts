import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { IResumeDocument } from '../resume/resume.schema';
import { PARSING_STATUS } from '../resume-parser/resume-parser.constants';
import { ResumeParseRepository } from '../resume-parser/resume-parser.repository';
import { IResumeParseDocument } from '../resume-parser/resume-parser.schema';
import { StructuredResume } from '../resume-parser/resume-parser.structuredResume';
import { AIService } from '../../shared/ai';
import { logger } from '../../shared/config/logger';
import { dedupeStrings } from '../../shared/utils/dedupeStrings';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/ApiError';
import { ANALYSIS_STATUS, RESUME_ANALYSIS_MESSAGES } from './resume-analysis.constants';
import { buildResumeAnalysisPrompt, resumeAnalysisResponseSchema } from './resume-analysis.prompt';
import { ResumeAnalysisRepository } from './resume-analysis.repository';
import { IResumeAnalysisDocument } from './resume-analysis.schema';
import { AnalysisStatusSummary, ResumeAnalysisResult, resumeAnalysisResultSchema } from './resume-analysis.types';

const ANALYZABLE_PARSE_STATUSES: string[] = [PARSING_STATUS.COMPLETED, PARSING_STATUS.SKIPPED_ALREADY_PARSED];

/** True if the given StructuredResume field actually has content - used to
 * reconcile the AI's claimed `missingSections` against ground truth so it can
 * never flag a section that is genuinely present in the parsed resume. */
function isSectionPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some((v) => v !== null && v !== undefined && v !== '');
  }
  return value !== '';
}

/** Deterministic post-processing applied to every AI response before it's
 * persisted/returned: never trust the model's claims about facts the code can
 * already verify, and never let repeated/near-duplicate phrasing through. */
function reconcileAndNormalize(
  result: ResumeAnalysisResult,
  structuredResume: StructuredResume
): ResumeAnalysisResult {
  const structuredResumeRecord = structuredResume as unknown as Record<string, unknown>;

  const missingSections = result.missingSections.filter((section) => !isSectionPresent(structuredResumeRecord[section]));

  const detailedScores = Object.fromEntries(
    Object.entries(result.detailedScores).map(([key, entry]) => [
      key,
      {
        ...entry,
        strengths: dedupeStrings(entry.strengths),
        weaknesses: dedupeStrings(entry.weaknesses),
        improvements: dedupeStrings(entry.improvements),
      },
    ])
  ) as ResumeAnalysisResult['detailedScores'];

  return {
    ...result,
    strengths: dedupeStrings(result.strengths),
    weaknesses: dedupeStrings(result.weaknesses),
    recommendations: dedupeStrings(result.recommendations),
    priorityImprovements: dedupeStrings(result.priorityImprovements),
    missingSections,
    detailedScores,
  };
}

export class ResumeAnalysisService {
  private resumeRepository: ResumeRepository;
  private resumeParseRepository: ResumeParseRepository;
  private repository: ResumeAnalysisRepository;
  private aiService: AIService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeParseRepository = new ResumeParseRepository();
    this.repository = new ResumeAnalysisRepository();
    this.aiService = new AIService();
  }

  async analyzeResume(
    userId: string,
    resumeId: string,
    correlationId?: string,
    options: { force?: boolean } = {}
  ): Promise<IResumeAnalysisDocument> {
    const force = options.force ?? false;

    const resume = await this.resumeRepository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(RESUME_ANALYSIS_MESSAGES.RESUME_NOT_FOUND);
    }
    if (!resume.isActive) {
      throw new BadRequestError(RESUME_ANALYSIS_MESSAGES.RESUME_NOT_ACTIVE);
    }

    const parse = await this.resumeParseRepository.findLatestByResumeId(resumeId, userId);
    if (!parse || !ANALYZABLE_PARSE_STATUSES.includes(parse.parsingStatus) || !parse.structuredResume) {
      throw new BadRequestError(RESUME_ANALYSIS_MESSAGES.PARSE_NOT_COMPLETED);
    }

    const existing = await this.repository.findLatestByParseId(parse._id as Types.ObjectId, userId);

    if (existing?.analysisStatus === ANALYSIS_STATUS.ANALYZING) {
      throw new ConflictError(RESUME_ANALYSIS_MESSAGES.ALREADY_ANALYZING);
    }

    // Once a call has been skipped, the LATEST record for this parseId is
    // itself a SKIPPED_ALREADY_ANALYZED row, not COMPLETED - so a third call
    // must also recognize SKIPPED_ALREADY_ANALYZED as "already have a usable
    // result," or idempotency would only hold for exactly two calls.
    if (
      !force &&
      existing &&
      (existing.analysisStatus === ANALYSIS_STATUS.COMPLETED ||
        existing.analysisStatus === ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED)
    ) {
      return this.skipAlreadyAnalyzed(existing, resumeId, parse, userId, correlationId);
    }

    const retryCount = existing && existing.analysisStatus === ANALYSIS_STATUS.FAILED ? existing.retryCount + 1 : 0;
    const base =
      force || !existing
        ? await this.repository.createPending(resumeId, parse._id as Types.ObjectId, userId)
        : existing;
    const record = await this.repository.markAnalysisStarted(base._id as Types.ObjectId, retryCount);

    if (!record) {
      throw new InternalServerError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    logger.info(
      `[ResumeAnalysis] Analysis started [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    return this.runAnalysisPipeline(record, resume, parse, correlationId);
  }

  async reanalyzeResume(userId: string, resumeId: string, correlationId?: string): Promise<IResumeAnalysisDocument> {
    return this.analyzeResume(userId, resumeId, correlationId, { force: true });
  }

  private async skipAlreadyAnalyzed(
    existing: IResumeAnalysisDocument,
    resumeId: string,
    parse: IResumeParseDocument,
    userId: string,
    correlationId?: string
  ): Promise<IResumeAnalysisDocument> {
    logger.info(
      `[ResumeAnalysis] Already analyzed, skipping [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    if (
      existing.overallScore === null ||
      existing.summary === null ||
      existing.strengths === null ||
      existing.weaknesses === null ||
      existing.recommendations === null ||
      existing.categoryScores === null ||
      existing.missingSections === null ||
      existing.priorityImprovements === null ||
      !existing.aiModel ||
      !existing.provider
    ) {
      throw new InternalServerError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    const skipRecord = await this.repository.createPending(resumeId, parse._id as Types.ObjectId, userId);
    const skipped = await this.repository.markSkippedAlreadyAnalyzed(skipRecord._id as Types.ObjectId, {
      overallScore: existing.overallScore,
      summary: existing.summary,
      strengths: existing.strengths,
      weaknesses: existing.weaknesses,
      recommendations: existing.recommendations,
      categoryScores: existing.categoryScores,
      detailedScores: existing.detailedScores,
      missingSections: existing.missingSections as ResumeAnalysisResult['missingSections'],
      priorityImprovements: existing.priorityImprovements,
      aiModel: existing.aiModel,
      provider: existing.provider,
      // Flatten the chain: if `existing` is itself a skip record, point at the
      // true original COMPLETED analysis it already references, not at the
      // intermediate skip - keeps duplicateOfAnalysisId always one hop away.
      duplicateOfAnalysisId: (existing.duplicateOfAnalysisId
        ? existing.duplicateOfAnalysisId
        : (existing._id as Types.ObjectId)
      ).toString(),
    });

    if (!skipped) {
      throw new InternalServerError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    return skipped;
  }

  private async runAnalysisPipeline(
    record: IResumeAnalysisDocument,
    resume: IResumeDocument,
    parse: IResumeParseDocument,
    correlationId?: string
  ): Promise<IResumeAnalysisDocument> {
    const resumeId = resume._id.toString();
    const startedAt = Date.now();

    try {
      logger.info(
        `[ResumeAnalysis] Structured resume loaded [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const prompt = buildResumeAnalysisPrompt(parse.structuredResume!);

      logger.info(`[ResumeAnalysis] AI request started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      const result = await this.aiService.generateStructuredOutput(prompt, resumeAnalysisResponseSchema);

      logger.info(`[ResumeAnalysis] Validation started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      const parsed = resumeAnalysisResultSchema.safeParse(result.data);
      if (!parsed.success) {
        throw new ValidationError(RESUME_ANALYSIS_MESSAGES.VALIDATION_FAILED);
      }

      const normalized = reconcileAndNormalize(parsed.data, parse.structuredResume!);

      const updated = await this.repository.markCompleted(record._id as Types.ObjectId, {
        ...normalized,
        aiModel: result.model,
        provider: result.provider,
      });

      if (!updated) {
        throw new InternalServerError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
      }

      const durationMs = Date.now() - startedAt;
      logger.info(`[ResumeAnalysis] Analysis persisted [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`);
      logger.info(
        `[ResumeAnalysis] Completed [ResumeID: ${resumeId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED;
      logger.error(
        `[ResumeAnalysis] Analysis failed [ResumeID: ${resumeId}] - ${message} [CorrelationID: ${correlationId}]`
      );
      await this.repository.markFailed(record._id as Types.ObjectId, message);

      if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new InternalServerError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }
  }

  async getStatus(userId: string, resumeId: string): Promise<AnalysisStatusSummary> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_NOT_FOUND);
    }

    return {
      resumeId: record.resumeId.toString(),
      parseId: record.parseId.toString(),
      analysisStatus: record.analysisStatus,
      analysisVersion: record.analysisVersion,
      promptVersion: record.promptVersion,
      analysisStartedAt: record.analysisStartedAt,
      analysisCompletedAt: record.analysisCompletedAt,
      lastAttemptedAt: record.lastAttemptedAt,
      errorMessage: record.errorMessage,
      retryCount: record.retryCount,
    };
  }

  async getRecord(userId: string, resumeId: string): Promise<IResumeAnalysisDocument> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(RESUME_ANALYSIS_MESSAGES.ANALYSIS_NOT_FOUND);
    }
    return record;
  }
}
