import { Types } from 'mongoose';
import { GENERATION_STATUS, INTERVIEW_GENERATOR_CONSTANTS } from './interview-generator.constants';
import { IInterviewGenerationDocument, InterviewGenerationModel } from './interview-generator.schema';
import { InterviewGenerationResult } from './interview-generator.types';

export type CompletedGenerationUpdate = {
  questions: InterviewGenerationResult;
  aiModel: string;
  provider: string;
};

export class InterviewGenerationRepository {
  async findLatestByResumeId(resumeId: string, userId: string): Promise<IInterviewGenerationDocument | null> {
    return InterviewGenerationModel.findOne({ resumeId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findLatestByParseIdAndJdId(
    parseId: Types.ObjectId | string,
    jobDescriptionAnalysisId: Types.ObjectId | string | null,
    userId: string
  ): Promise<IInterviewGenerationDocument | null> {
    return InterviewGenerationModel.findOne({
      parseId,
      jobDescriptionAnalysisId: jobDescriptionAnalysisId ?? null,
      userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });
  }

  async createPending(
    resumeId: string,
    parseId: Types.ObjectId | string,
    jobDescriptionAnalysisId: Types.ObjectId | string | null,
    userId: string
  ): Promise<IInterviewGenerationDocument> {
    return InterviewGenerationModel.create({
      resumeId,
      parseId,
      jobDescriptionAnalysisId: jobDescriptionAnalysisId ?? null,
      userId,
      generationStatus: GENERATION_STATUS.PENDING,
      generationVersion: INTERVIEW_GENERATOR_CONSTANTS.CURRENT_GENERATION_VERSION,
      promptVersion: INTERVIEW_GENERATOR_CONSTANTS.CURRENT_PROMPT_VERSION,
      retryCount: 0,
    });
  }

  async markGenerationStarted(
    id: Types.ObjectId | string,
    retryCount: number
  ): Promise<IInterviewGenerationDocument | null> {
    return InterviewGenerationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          generationStatus: GENERATION_STATUS.GENERATING,
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
    update: CompletedGenerationUpdate
  ): Promise<IInterviewGenerationDocument | null> {
    const now = new Date();
    return InterviewGenerationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          generationStatus: GENERATION_STATUS.COMPLETED,
          questions: update.questions,
          aiModel: update.aiModel,
          provider: update.provider,
          analysisCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markSkippedAlreadyGenerated(
    id: Types.ObjectId | string,
    update: CompletedGenerationUpdate & { duplicateOfGenerationId: string }
  ): Promise<IInterviewGenerationDocument | null> {
    const now = new Date();
    return InterviewGenerationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          generationStatus: GENERATION_STATUS.SKIPPED_ALREADY_GENERATED,
          questions: update.questions,
          aiModel: update.aiModel,
          provider: update.provider,
          duplicateOfGenerationId: update.duplicateOfGenerationId,
          analysisCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markFailed(id: Types.ObjectId | string, errorMessage: string): Promise<IInterviewGenerationDocument | null> {
    return InterviewGenerationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          generationStatus: GENERATION_STATUS.FAILED,
          errorMessage,
          lastAttemptedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
