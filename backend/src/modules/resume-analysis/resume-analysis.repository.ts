import { Types } from 'mongoose';
import { ANALYSIS_STATUS, RESUME_ANALYSIS_CONSTANTS } from './resume-analysis.constants';
import { IResumeAnalysisDocument, ResumeAnalysisModel } from './resume-analysis.schema';
import { ResumeAnalysisResult } from './resume-analysis.types';

export type CompletedAnalysisUpdate = ResumeAnalysisResult & {
  aiModel: string;
  provider: string;
};

// `detailedScores` is required on a *fresh* AI result, but a "skip, already
// analyzed" copy may be cloning a pre-existing record from before this field
// existed - allow null there so old analyses keep working without a crash;
// the field simply back-fills the next time that resume is actually re-analyzed.
export type SkippedAnalysisUpdate = Omit<CompletedAnalysisUpdate, 'detailedScores'> & {
  detailedScores: ResumeAnalysisResult['detailedScores'] | null;
  duplicateOfAnalysisId: string;
};

export class ResumeAnalysisRepository {
  async findLatestByResumeId(resumeId: string, userId: string): Promise<IResumeAnalysisDocument | null> {
    return ResumeAnalysisModel.findOne({ resumeId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findLatestByParseId(
    parseId: Types.ObjectId | string,
    userId: string
  ): Promise<IResumeAnalysisDocument | null> {
    return ResumeAnalysisModel.findOne({ parseId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async createPending(
    resumeId: string,
    parseId: Types.ObjectId | string,
    userId: string
  ): Promise<IResumeAnalysisDocument> {
    return ResumeAnalysisModel.create({
      resumeId,
      parseId,
      userId,
      analysisStatus: ANALYSIS_STATUS.PENDING,
      analysisVersion: RESUME_ANALYSIS_CONSTANTS.CURRENT_ANALYSIS_VERSION,
      promptVersion: RESUME_ANALYSIS_CONSTANTS.CURRENT_PROMPT_VERSION,
      retryCount: 0,
    });
  }

  async markAnalysisStarted(
    id: Types.ObjectId | string,
    retryCount: number
  ): Promise<IResumeAnalysisDocument | null> {
    return ResumeAnalysisModel.findByIdAndUpdate(
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
  ): Promise<IResumeAnalysisDocument | null> {
    const now = new Date();
    return ResumeAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.COMPLETED,
          overallScore: update.overallScore,
          summary: update.summary,
          strengths: update.strengths,
          weaknesses: update.weaknesses,
          recommendations: update.recommendations,
          categoryScores: update.categoryScores,
          detailedScores: update.detailedScores,
          missingSections: update.missingSections,
          priorityImprovements: update.priorityImprovements,
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
  ): Promise<IResumeAnalysisDocument | null> {
    const now = new Date();
    return ResumeAnalysisModel.findByIdAndUpdate(
      id,
      {
        $set: {
          analysisStatus: ANALYSIS_STATUS.SKIPPED_ALREADY_ANALYZED,
          overallScore: update.overallScore,
          summary: update.summary,
          strengths: update.strengths,
          weaknesses: update.weaknesses,
          recommendations: update.recommendations,
          categoryScores: update.categoryScores,
          detailedScores: update.detailedScores,
          missingSections: update.missingSections,
          priorityImprovements: update.priorityImprovements,
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

  async markFailed(id: Types.ObjectId | string, errorMessage: string): Promise<IResumeAnalysisDocument | null> {
    return ResumeAnalysisModel.findByIdAndUpdate(
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

  async existsForResumeIds(resumeIds: string[]): Promise<Set<string>> {
    const docs = await ResumeAnalysisModel.find({ resumeId: { $in: resumeIds }, isDeleted: false }).select(
      'resumeId'
    );
    return new Set(docs.map((doc) => doc.resumeId.toString()));
  }
}
