import { Types } from 'mongoose';
import { PARSING_STATUS } from './resume-parser.constants';
import { StructuredResume } from './resume-parser.structuredResume';

export type ParsingStatus = (typeof PARSING_STATUS)[keyof typeof PARSING_STATUS];

export interface IResumeParse {
  _id: string;
  resumeId: Types.ObjectId | string;
  processingId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  structuredResume: StructuredResume | null;
  parsingStatus: ParsingStatus;
  parsingVersion: number;
  promptVersion: number;
  aiModel: string | null;
  provider: string | null;
  parsingStartedAt: Date | null;
  parsingCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfParseId: Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParseResumeDTO {
  resumeId: string;
}

export interface ParsingStatusSummary {
  resumeId: string;
  processingId: string;
  parsingStatus: ParsingStatus;
  parsingVersion: number;
  promptVersion: number;
  parsingStartedAt: Date | null;
  parsingCompletedAt: Date | null;
  lastAttemptedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
}
