import { Types } from 'mongoose';
import { ANALYSIS_STATUS, JD_ANALYSIS_CONSTANTS } from './job-description-analysis.constants';
import { IJobDescriptionAnalysisDocument, JobDescriptionAnalysisModel } from './job-description-analysis.schema';
import { JobDescriptionAnalysisResult } from './job-description-analysis.types';

export type CompletedAnalysisUpdate = JobDescriptionAnalysisResult & {
  aiModel: string;
  provider: string;
};

// `extractedRequirements`/`learningRoadmap` are required on a *fresh* AI result,
// but a "skip, already analyzed" copy may be cloning a pre-existing record from
// before these fields existed - allow null there so old analyses keep working;
// they simply back-fill the next time that resume/JD pair is actually re-analyzed.
export type SkippedAnalysisUpdate = Omit<CompletedAnalysisUpdate, 'extractedRequirements' | 'learningRoadmap'> & {
  extractedRequirements: JobDescriptionAnalysisResult['extractedRequirements'] | null;
  learningRoadmap: string[] | null;
  duplicateOfAnalysisId: string;
};

export class JobDescriptionAnalysisRepository {
  async findLatestByResumeId(resumeId: string, userId: string): Promise<IJobDescriptionAnalysisDocument | null> {
    return JobDescriptionAnalysisModel.findOne({ resumeId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findLatestByParseId(
    parseId: Types.ObjectId | string,
    userId: string
  ): Promise<IJobDescriptionAnalysisDocument | null> {
    return JobDescriptionAnalysisModel.findOne({ parseId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findLatestByParseIdAndHash(
    parseId: Types.ObjectId | string,
    jobDescriptionHash: string,
    userId: string
  ): Promise<IJobDescriptionAnalysisDocument | null> {
    return JobDescriptionAnalysisModel.findOne({ parseId, jobDescriptionHash, userId, isDeleted: false }).sort({
      createdAt: -1,
    });
  }

  async createPending(
    resumeId: string,
    parseId: Types.ObjectId | string,
    userId: string,
    jobDescription: string,
    jobDescriptionHash: string
  ): Promise<IJobDescriptionAnalysisDocument> {
    return JobDescriptionAnalysisModel.create({
      resumeId,
      parseId,
      userId,
      jobDescription,
      jobDescriptionHash,
      analysisStatus: ANALYSIS_STATUS.PENDING,
      analysisVersion: JD_ANALYSIS_CONSTANTS.CURRENT_ANALYSIS_VERSION,
      promptVersion: JD_ANALYSIS_CONSTANTS.CURRENT_PROMPT_VERSION,
      retryCount: 0,
    });
  }

  async markAnalysisStarted(
    id: Types.ObjectId | string,
    retryCount: number
  ): Promise<IJobDescriptionAnalysisDocument | null> {
    return JobDescriptionAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.ANALYZING,
          analysisStartedAt: new Date(),
          errorMessage: null,
          retryCount,
        },
      },
      { new: true }
    );
  }

  async markCompleted(
    id: Types.ObjectId | string,
    update: CompletedAnalysisUpdate
  ): Promise<IJobDescriptionAnalysisDocument | null> {
    const now = new Date();
    return JobDescriptionAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.COMPLETED,
          overallMatchScore: update.overallMatchScore,
          summary: update.summary,
          matchingSkills: update.matchingSkills,
          missingSkills: update.missingSkills,
          matchingExperience: update.matchingExperience,
          experienceGaps: update.experienceGaps,
          educationMatch: update.educationMatch,
          projectRelevance: update.projectRelevance,
          keywordCoverage: update.keywordCoverage,
          strengths: update.strengths,
          weaknesses: update.weaknesses,
          recommendations: update.recommendations,
          hiringRecommendation: update.hiringRecommendation,
          priorityImprovements: update.priorityImprovements,
          extractedRequirements: update.extractedRequirements,
          learningRoadmap: update.learningRoadmap,
          aiModel: update.aiModel,
          provider: update.provider,
          analysisCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markSkippedAlreadyAnalyzed(
    id: Types.ObjectId | string,
    update: SkippedAnalysisUpdate
  ): Promise<IJobDescriptionAnalysisDocument | null> {
    const now = new Date();
    return JobDescriptionAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED,
          overallMatchScore: update.overallMatchScore,
          summary: update.summary,
          matchingSkills: update.matchingSkills,
          missingSkills: update.missingSkills,
          matchingExperience: update.matchingExperience,
          experienceGaps: update.experienceGaps,
          educationMatch: update.educationMatch,
          projectRelevance: update.projectRelevance,
          keywordCoverage: update.keywordCoverage,
          strengths: update.strengths,
          weaknesses: update.weaknesses,
          recommendations: update.recommendations,
          hiringRecommendation: update.hiringRecommendation,
          priorityImprovements: update.priorityImprovements,
          extractedRequirements: update.extractedRequirements,
          learningRoadmap: update.learningRoadmap,
          aiModel: update.aiModel,
          provider: update.provider,
          duplicateOfAnalysisId: update.duplicateOfAnalysisId,
          analysisCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markFailed(id: Types.ObjectId | string, errorMessage: string): Promise<IJobDescriptionAnalysisDocument | null> {
    return JobDescriptionAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.FAILED,
          errorMessage,
          lastAttemptedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
