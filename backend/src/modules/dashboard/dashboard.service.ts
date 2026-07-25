import { Types } from 'mongoose';
import { ResumeRepository } from '../resume/resume.repository';
import { ANALYSIS_STATUS as JD_ANALYSIS_STATUS } from '../job-description-analysis/job-description-analysis.constants';
import { JobDescriptionAnalysisRepository } from '../job-description-analysis/job-description-analysis.repository';
import { PARSING_STATUS } from '../resume-parser/resume-parser.constants';
import { ResumeParseRepository } from '../resume-parser/resume-parser.repository';
import { ANALYSIS_STATUS as RESUME_ANALYSIS_STATUS } from '../resume-analysis/resume-analysis.constants';
import { ResumeAnalysisRepository } from '../resume-analysis/resume-analysis.repository';
import { GENERATION_STATUS } from '../interview-generator/interview-generator.constants';
import { InterviewGenerationRepository } from '../interview-generator/interview-generator.repository';
import { logger } from '../../shared/config/logger';
import { DashboardSummary, DashboardTimelineStage } from './dashboard.types';

const USABLE_PARSE_STATUSES: string[] = [PARSING_STATUS.COMPLETED, PARSING_STATUS.SKIPPED_ALREADY_PARSED];
const USABLE_RESUME_ANALYSIS_STATUSES: string[] = [
  RESUME_ANALYSIS_STATUS.COMPLETED,
  RESUME_ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED,
];
const USABLE_JD_ANALYSIS_STATUSES: string[] = [JD_ANALYSIS_STATUS.COMPLETED, JD_ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED];
const USABLE_GENERATION_STATUSES: string[] = [
  GENERATION_STATUS.COMPLETED,
  GENERATION_STATUS.SKIPPED_ALREADY_GENERATED,
];

const EMPTY_TIMELINE: DashboardTimelineStage[] = [
  { stage: 'RESUME_UPLOADED', completed: false, completedAt: null },
  { stage: 'RESUME_PARSED', completed: false, completedAt: null },
  { stage: 'RESUME_ANALYZED', completed: false, completedAt: null },
  { stage: 'JD_COMPARED', completed: false, completedAt: null },
  { stage: 'INTERVIEW_GENERATED', completed: false, completedAt: null },
];

export class DashboardService {
  private resumeRepository: ResumeRepository;
  private resumeParseRepository: ResumeParseRepository;
  private resumeAnalysisRepository: ResumeAnalysisRepository;
  private jobDescriptionAnalysisRepository: JobDescriptionAnalysisRepository;
  private interviewGenerationRepository: InterviewGenerationRepository;

  constructor() {
    this.resumeRepository = new ResumeRepository();
    this.resumeParseRepository = new ResumeParseRepository();
    this.resumeAnalysisRepository = new ResumeAnalysisRepository();
    this.jobDescriptionAnalysisRepository = new JobDescriptionAnalysisRepository();
    this.interviewGenerationRepository = new InterviewGenerationRepository();
  }

  async getDashboard(userId: string, correlationId?: string): Promise<DashboardSummary> {
    const startedAt = Date.now();
    logger.info(`[Dashboard] Dashboard requested [UserID: ${userId}] [CorrelationID: ${correlationId}]`);

    const resume = await this.resumeRepository.findActiveByUserId(userId);
    if (!resume) {
      const durationMs = Date.now() - startedAt;
      logger.info(
        `[Dashboard] Aggregation completed [UserID: ${userId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );
      return {
        latestResume: null,
        latestParseStatus: null,
        latestResumeScore: null,
        latestJDMatchScore: null,
        latestInterviewGeneration: null,
        overallCompletion: 0,
        timeline: EMPTY_TIMELINE,
      };
    }

    const resumeId = resume._id.toString();
    const [parse, analysis, jdAnalysis, interviewGeneration] = await Promise.all([
      this.resumeParseRepository.findLatestByResumeId(resumeId, userId),
      this.resumeAnalysisRepository.findLatestByResumeId(resumeId, userId),
      this.jobDescriptionAnalysisRepository.findLatestByResumeId(resumeId, userId),
      this.interviewGenerationRepository.findLatestByResumeId(resumeId, userId),
    ]);

    const timeline: DashboardTimelineStage[] = [
      { stage: 'RESUME_UPLOADED', completed: true, completedAt: resume.uploadedAt },
      {
        stage: 'RESUME_PARSED',
        completed: !!parse && USABLE_PARSE_STATUSES.includes(parse.parsingStatus),
        completedAt: parse?.parsingCompletedAt ?? null,
      },
      {
        stage: 'RESUME_ANALYZED',
        completed: !!analysis && USABLE_RESUME_ANALYSIS_STATUSES.includes(analysis.analysisStatus),
        completedAt: analysis?.analysisCompletedAt ?? null,
      },
      {
        stage: 'JD_COMPARED',
        completed: !!jdAnalysis && USABLE_JD_ANALYSIS_STATUSES.includes(jdAnalysis.analysisStatus),
        completedAt: jdAnalysis?.analysisCompletedAt ?? null,
      },
      {
        stage: 'INTERVIEW_GENERATED',
        completed: !!interviewGeneration && USABLE_GENERATION_STATUSES.includes(interviewGeneration.generationStatus),
        completedAt: interviewGeneration?.analysisCompletedAt ?? null,
      },
    ];

    const completedStageCount = timeline.filter((stage) => stage.completed).length;
    const overallCompletion = Math.round((completedStageCount / timeline.length) * 100);

    const durationMs = Date.now() - startedAt;
    logger.info(
      `[Dashboard] Aggregation completed [UserID: ${userId}] - ${durationMs}ms [CorrelationID: ${correlationId}]`
    );

    return {
      latestResume: {
        id: resumeId,
        originalFilename: resume.originalFilename,
        version: resume.version,
        uploadedAt: resume.uploadedAt,
      },
      latestParseStatus: parse?.parsingStatus ?? null,
      latestResumeScore: analysis?.overallScore ?? null,
      latestJDMatchScore: jdAnalysis?.overallMatchScore ?? null,
      latestInterviewGeneration: interviewGeneration
        ? {
            id: (interviewGeneration._id as Types.ObjectId).toString(),
            generationStatus: interviewGeneration.generationStatus,
            overallDifficulty: interviewGeneration.questions?.overallDifficulty ?? null,
            estimatedInterviewDuration: interviewGeneration.questions?.estimatedInterviewDuration ?? null,
            generationCompletedAt: interviewGeneration.analysisCompletedAt,
          }
        : null,
      overallCompletion,
      timeline,
    };
  }
}
