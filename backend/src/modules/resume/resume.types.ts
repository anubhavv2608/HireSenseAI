import { Types } from 'mongoose';

export interface IResume {
  _id: string;
  userId: Types.ObjectId | string;
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

export interface CreateResumeDTO {
  userId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  storageProvider: string;
  storagePublicId: string;
  storageUrl: string;
  version: number;
  isActive: boolean;
  uploadSource?: string;
  status?: string;
}
