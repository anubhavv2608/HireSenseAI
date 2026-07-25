import { Schema, model, Document, Types } from 'mongoose';

export interface IResumeDocument extends Document {
  userId: Types.ObjectId;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  storageProvider: string;
  storagePublicId: string;
  storageUrl: string;
  version: number;
  isActive: boolean;
  uploadSource: string;
  status: string;
  uploadedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    storageProvider: {
      type: String,
      required: true,
    },
    storagePublicId: {
      type: String,
      required: true,
    },
    storageUrl: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    uploadSource: {
      type: String,
      default: 'manual',
    },
    status: {
      type: String,
      default: 'uploaded',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ResumeModel = model<IResumeDocument>('Resume', resumeSchema);
