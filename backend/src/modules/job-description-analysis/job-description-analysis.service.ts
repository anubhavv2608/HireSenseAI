import { createHash } from 'crypto';
import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { IResumeDocument } from '../resume/resume.schema';
import { PARSING_STATUS } from '../resume-parser/resume-parser.constants';
import { ResumeParseRepository } from '../resume-parser/resume-parser.repository';
import { IResumeParseDocument } from '../resume-parser/resume-parser.schema';
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
import { ANALYSIS_STATUS, JD_ANALYSIS_MESSAGES } from './job-description-analysis.constants';
import { buildJobDescriptionAnalysisPrompt, jobDescriptionAnalysisResponseSchema } from './job-description-analysis.prompt';
import { JobDescriptionAnalysisRepository } from './job-description-analysis.repository';
import { IJobDescriptionAnalysisDocument } from './job-description-analysis.schema';
import {
  AnalysisStatusSummary,
  JobDescriptionAnalysisResult,
  jobDescriptionAnalysisResultSchema,
} from './job-description-analysis.types';

const ANALYZABLE_PARSE_STATUSES: string[] = [PARSING_STATUS.COMPLETED, PARSING_STATUS.SKIPPED_ALREADY_PARSED];

/** Deterministic post-processing applied to every AI response before it's
 * persisted/returned: de-duplicate repeated/near-duplicate phrasing rather than
 * trusting the model's raw list output. Never trust the model's claims about
 * facts the code can already verify; here, missingSkills is cross-checked
 * against matchingSkills so a skill can never appear as both matched and missing. */
function normalizeJdAnalysis(result: JobDescriptionAnalysisResult): JobDescriptionAnalysisResult {
  const matchingSkills = dedupeStrings(result.matchingSkills);
  const matchingSet = new Set(matchingSkills.map((skill) => skill.trim().toLowerCase()));
  const missingSkills = dedupeStrings(result.missingSkills).filter(
    (skill) => !matchingSet.has(skill.trim().toLowerCase())
  );

  return {
    ...result,
    matchingSkills,
    missingSkills,
    matchingExperience: dedupeStrings(result.matchingExperience),
    experienceGaps: dedupeStrings(result.experienceGaps),
    strengths: dedupeStrings(result.strengths),
    weaknesses: dedupeStrings(result.weaknesses),
    recommendations: dedupeStrings(result.recommendations),
    priorityImprovements: dedupeStrings(result.priorityImprovements),
    learningRoadmap: dedupeStrings(result.learningRoadmap),
    extractedRequirements: {
      languages: dedupeStrings(result.extractedRequirements.languages),
      frameworks: dedupeStrings(result.extractedRequirements.frameworks),
      libraries: dedupeStrings(result.extractedRequirements.libraries),
      databases: dedupeStrings(result.extractedRequirements.databases),
      responsibilities: dedupeStrings(result.extractedRequirements.responsibilities),
      requiredQualifications: dedupeStrings(result.extractedRequirements.requiredQualifications),
      preferredQualifications: dedupeStrings(result.extractedRequirements.preferredQualifications),
      softSkills: dedupeStrings(result.extractedRequirements.softSkills),
    },
  };
}

export class JobDescriptionAnalysisService {
  private resumeRepository: ResumeRepository;
  private resumeParseRepository: ResumeParseRepository;
  private repository: JobDescriptionAnalysisRepository;
  private aiService: AIService;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeParseRepository = new ResumeParseRepository();
    this.repository = new JobDescriptionAnalysisRepository();
    this.aiService = new AIService();
  }

  async analyzeResume(
    userId: string,
    resumeId: string,
    jobDescription: string,
    correlationId?: string,
    options: { force?: boolean } = {}
  ): Promise<IJobDescriptionAnalysisDocument> {
    const force = options.force ?? false;

    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new BadRequestError(JD_ANALYSIS_MESSAGES.EMPTY_JOB_DESCRIPTION);
    }

    const resume = await this.resumeRepository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(JD_ANALYSIS_MESSAGES.RESUME_NOT_FOUND);
    }
    if (!resume.isActive) {
      throw new BadRequestError(JD_ANALYSIS_MESSAGES.RESUME_NOT_ACTIVE);
    }

    const parse = await this.resumeParseRepository.findLatestByResumeId(resumeId, userId);
    if (!parse || !ANALYZABLE_PARSE_STATUSES.includes(parse.parsingStatus) || !parse.structuredResume) {
      throw new BadRequestError(JD_ANALYSIS_MESSAGES.PARSE_NOT_COMPLETED);
    }

    logger.info(
      `[JobDescriptionAnalysis] Job description received [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
    );
    const normalizedJobDescription = this.normalizeJobDescription(jobDescription);
    const jobDescriptionHash = createHash('sha256').update(normalizedJobDescription).digest('hex');
    logger.info(
      `[JobDescriptionAnalysis] Hash generated [ResumeID: ${resumeId}] [Hash: ${jobDescriptionHash}] [CorrelationID: ${correlationId}]`
    );

    const existing = await this.repository.findLatestByParseIdAndHash(
      parse._id as Types.ObjectId,
      jobDescriptionHash,
      userId
    );

    if (existing?.analysisStatus === ANALYSIS_STATUS.ANALYZING) {
      throw new ConflictError(JD_ANALYSIS_MESSAGES.ALREADY_ANALYZING);
    }

    // Once a call has been skipped, the LATEST record for this (parseId, hash)
    // pair is itself a SKIPPED_ALREADY_ANALYZED row, not COMPLETED - so a third
    // call must also recognize SKIPPED_ALREADY_ANALYZED as "already have a
    // usable result," or idempotency would only hold for exactly two calls.
    if (
      !force &&
      existing &&
      (existing.analysisStatus === ANALYSIS_STATUS.COMPLETED ||
        existing.analysisStatus === ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED)
    ) {
      return this.skipAlreadyAnalyzed(existing, resumeId, parse, userId, jobDescription, jobDescriptionHash, correlationId);
    }

    const retryCount = existing && existing.analysisStatus === ANALYSIS_STATUS.FAILED ? existing.retryCount + 1 : 0;
    const base =
      force || !existing
        ? await this.repository.createPending(
            resumeId,
            parse._id as Types.ObjectId,
            userId,
            jobDescription,
            jobDescriptionHash
          )
        : existing;
    const record = await this.repository.markAnalysisStarted(base._id as Types.ObjectId, retryCount);

    if (!record) {
      throw new InternalServerError(JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    logger.info(
      `[JobDescriptionAnalysis] Analysis started [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    return this.runAnalysisPipeline(record, resume, parse, jobDescription, correlationId);
  }

  async reanalyzeResume(
    userId: string,
    resumeId: string,
    jobDescription: string,
    correlationId?: string
  ): Promise<IJobDescriptionAnalysisDocument> {
    return this.analyzeResume(userId, resumeId, jobDescription, correlationId, { force: true });
  }

  private normalizeJobDescription(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  private async skipAlreadyAnalyzed(
    existing: IJobDescriptionAnalysisDocument,
    resumeId: string,
    parse: IResumeParseDocument,
    userId: string,
    jobDescription: string,
    jobDescriptionHash: string,
    correlationId?: string
  ): Promise<IJobDescriptionAnalysisDocument> {
    logger.info(
      `[JobDescriptionAnalysis] Already analyzed, skipping [ResumeID: ${resumeId}] [ParseID: ${parse._id}] [CorrelationID: ${correlationId}]`
    );

    if (
      existing.overallMatchScore === null ||
      existing.summary === null ||
      existing.matchingSkills === null ||
      existing.missingSkills === null ||
      existing.matchingExperience === null ||
      existing.experienceGaps === null ||
      existing.educationMatch === null ||
      existing.projectRelevance === null ||
      existing.keywordCoverage === null ||
      existing.strengths === null ||
      existing.weaknesses === null ||
      existing.recommendations === null ||
      existing.hiringRecommendation === null ||
      existing.priorityImprovements === null ||
      !existing.aiModel ||
      !existing.provider
    ) {
      throw new InternalServerError(JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    const skipRecord = await this.repository.createPending(
      resumeId,
      parse._id as Types.ObjectId,
      userId,
      jobDescription,
      jobDescriptionHash
    );
    const skipped = await this.repository.markSkippedAlreadyAnalyzed(skipRecord._id as Types.ObjectId, {
      overallMatchScore: existing.overallMatchScore,
      summary: existing.summary,
      matchingSkills: existing.matchingSkills,
      missingSkills: existing.missingSkills,
      matchingExperience: existing.matchingExperience,
      experienceGaps: existing.experienceGaps,
      educationMatch: existing.educationMatch,
      projectRelevance: existing.projectRelevance,
      keywordCoverage: existing.keywordCoverage,
      strengths: existing.strengths,
      weaknesses: existing.weaknesses,
      recommendations: existing.recommendations,
      hiringRecommendation: existing.hiringRecommendation as JobDescriptionAnalysisResult['hiringRecommendation'],
      priorityImprovements: existing.priorityImprovements,
      extractedRequirements: existing.extractedRequirements,
      learningRoadmap: existing.learningRoadmap,
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
      throw new InternalServerError(JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }

    return skipped;
  }

  private async runAnalysisPipeline(
    record: IJobDescriptionAnalysisDocument,
    resume: IResumeDocument,
    parse: IResumeParseDocument,
    jobDescription: string,
    correlationId?: string
  ): Promise<IJobDescriptionAnalysisDocument> {
    const resumeId = resume._id.toString();
    const startedAt = Date.now();

    try {
      logger.info(
        `[JobDescriptionAnalysis] Structured resume loaded [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const prompt = buildJobDescriptionAnalysisPrompt(parse.structuredResume!, jobDescription);

      logger.info(
        `[JobDescriptionAnalysis] AI request started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const result = await this.aiService.generateStructuredOutput(prompt, jobDescriptionAnalysisResponseSchema);

      logger.info(
        `[JobDescriptionAnalysis] Validation started [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      const parsed = jobDescriptionAnalysisResultSchema.safeParse(result.data);
      if (!parsed.success) {
        throw new ValidationError(JD_ANALYSIS_MESSAGES.VALIDATION_FAILED);
      }

      const normalized = normalizeJdAnalysis(parsed.data);

      const updated = await this.repository.markCompleted(record._id as Types.ObjectId, {
        ...normalized,
        aiModel: result.model,
        provider: result.provider,
      });

      if (!updated) {
        throw new InternalServerError(JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
      }

      const durationMs = Date.now() - startedAt;
      logger.info(
        `[JobDescriptionAnalysis] Persistence completed [ResumeID: ${resumeId}] [CorrelationID: ${correlationId}]`
      );
      logger.info(
        `[JobDescriptionAnalysis] Completed [ResumeID: ${resumeId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );

      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED;
      logger.error(
        `[JobDescriptionAnalysis] Analysis failed [ResumeID: ${resumeId}] - ${message} [CorrelationID: ${correlationId}]`
      );
      await this.repository.markFailed(record._id as Types.ObjectId, message);

      if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new InternalServerError(JD_ANALYSIS_MESSAGES.ANALYSIS_FAILED);
    }
  }

  async getStatus(userId: string, resumeId: string): Promise<AnalysisStatusSummary> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(JD_ANALYSIS_MESSAGES.ANALYSIS_NOT_FOUND);
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

  async getRecord(userId: string, resumeId: string): Promise<IJobDescriptionAnalysisDocument> {
    const record = await this.repository.findLatestByResumeId(resumeId, userId);
    if (!record) {
      throw new NotFoundError(JD_ANALYSIS_MESSAGES.ANALYSIS_NOT_FOUND);
    }
    return record;
  }
}
