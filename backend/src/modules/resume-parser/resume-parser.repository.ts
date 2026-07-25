import { Types } from 'mongoose';
import { PARSING_STATUS, RESUME_PARSER_CONSTANTS } from './resume-parser.constants';
import { IResumeParseDocument, ResumeParseModel } from './resume-parser.schema';
import { StructuredResume } from './resume-parser.structuredResume';

export interface CompletedParseUpdate {
  structuredResume: StructuredResume;
  aiModel: string;
  provider: string;
}

export class ResumeParseRepository {
  async findLatestByResumeId(resumeId: string, userId: string): Promise<IResumeParseDocument | null> {
    return ResumeParseModel.findOne({ resumeId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async findLatestByProcessingId(
    processingId: Types.ObjectId | string,
    userId: string
  ): Promise<IResumeParseDocument | null> {
    return ResumeParseModel.findOne({ processingId, userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async createPending(
    resumeId: string,
    processingId: Types.ObjectId | string,
    userId: string
  ): Promise<IResumeParseDocument> {
    return ResumeParseModel.create({
      resumeId,
      processingId,
      userId,
      parsingStatus: PARSING_STATUS.PENDING,
      parsingVersion: RESUME_PARSER_CONSTANTS.CURRENT_PARSING_VERSION,
      promptVersion: RESUME_PARSER_CONSTANTS.CURRENT_PROMPT_VERSION,
      retryCount: 0,
    });
  }

  async markParsingStarted(
    id: Types.ObjectId | string,
    retryCount: number
  ): Promise<IResumeParseDocument | null> {
    return ResumeParseModel.findByIdAndUpdate(
      id,
      {
        $set: {
          parsingStatus: PARSING_STATUS.PARSING,
          parsingStartedAt: new Date(),
          errorMessage: null,
          retryCount,
        },
      },
      { new: true }
    );
  }

  async markCompleted(
    id: Types.ObjectId | string,
    update: CompletedParseUpdate
  ): Promise<IResumeParseDocument | null> {
    const now = new Date();
    return ResumeParseModel.findByIdAndUpdate(
      id,
      {
        $set: {
          parsingStatus: PARSING_STATUS.COMPLETED,
          structuredResume: update.structuredResume,
          aiModel: update.aiModel,
          provider: update.provider,
          parsingCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markSkippedAlreadyParsed(
    id: Types.ObjectId | string,
    update: CompletedParseUpdate & { duplicateOfParseId: string }
  ): Promise<IResumeParseDocument | null> {
    const now = new Date();
    return ResumeParseModel.findByIdAndUpdate(
      id,
      {
        $set: {
          parsingStatus: PARSING_STATUS.SKIPPED_ALREADY_PARSED,
          structuredResume: update.structuredResume,
          aiModel: update.aiModel,
          provider: update.provider,
          duplicateOfParseId: update.duplicateOfParseId,
          parsingCompletedAt: now,
          lastAttemptedAt: now,
        },
      },
      { new: true }
    );
  }

  async markFailed(id: Types.ObjectId | string, errorMessage: string): Promise<IResumeParseDocument | null> {
    return ResumeParseModel.findByIdAndUpdate(
      id,
      {
        $set: {
          parsingStatus: PARSING_STATUS.FAILED,
          errorMessage,
          lastAttemptedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
