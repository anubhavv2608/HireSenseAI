import { StorageService } from '../../shared/storage/services/StorageService';
import { StorageFile } from '../../shared/storage/types';
import { BadRequestError, NotFoundError } from '../../shared/errors/ApiError';
import { RESUME_CONSTANTS, RESUME_MESSAGES } from './resume.constants';
import { ResumeRepository } from './resume.repository';
import { IResumeDocument } from './resume.schema';

export class ResumeService {
  private repository: ResumeRepository;
  private storageService: StorageService;

  constructor() {
    this.repository = new ResumeRepository();
    this.storageService = new StorageService();
  }

  private validatePdfFile(file?: StorageFile): void {
    if (!file || !file.buffer) {
      throw new BadRequestError('No file provided');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestError(RESUME_MESSAGES.INVALID_FILE_FORMAT);
    }
  }

  async uploadResume(userId: string, file: StorageFile): Promise<IResumeDocument> {
    this.validatePdfFile(file);

    // Upload via StorageService
    const uploadResult = await this.storageService.uploadFile(file, {
      folder: RESUME_CONSTANTS.DEFAULT_STORAGE_FOLDER,
      allowedMimeTypes: [...RESUME_CONSTANTS.ALLOWED_MIME_TYPES],
    });

    const currentLatestVersion = await this.repository.findLatestVersionByUserId(userId);
    const nextVersion = currentLatestVersion + 1;

    // Deactivate current active resumes
    await this.repository.deactivateAllByUserId(userId);

    // Create DB record
    const resume = await this.repository.createResume({
      userId,
      originalFilename: uploadResult.originalFilename,
      storedFilename: uploadResult.storedFilename,
      mimeType: uploadResult.mimeType,
      fileSize: uploadResult.fileSize,
      storageProvider: uploadResult.provider,
      storagePublicId: uploadResult.publicId,
      storageUrl: uploadResult.secureUrl,
      version: nextVersion,
      isActive: true,
      uploadSource: 'manual',
      status: 'uploaded',
    });

    return resume;
  }

  async replaceResume(userId: string, file: StorageFile): Promise<IResumeDocument> {
    return this.uploadResume(userId, file);
  }

  async getActiveResume(userId: string): Promise<IResumeDocument> {
    const resume = await this.repository.findActiveByUserId(userId);
    if (!resume) {
      throw new NotFoundError(RESUME_MESSAGES.RESUME_NOT_FOUND);
    }
    return resume;
  }

  async getResumeHistory(userId: string): Promise<IResumeDocument[]> {
    return this.repository.findAllByUserId(userId);
  }

  async setActiveResume(userId: string, resumeId: string): Promise<IResumeDocument> {
    const updated = await this.repository.setActiveResume(resumeId, userId);
    if (!updated) {
      throw new NotFoundError(RESUME_MESSAGES.RESUME_NOT_FOUND);
    }
    return updated;
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await this.repository.findById(resumeId, userId);
    if (!resume) {
      throw new NotFoundError(RESUME_MESSAGES.RESUME_NOT_FOUND);
    }

    const wasActive = resume.isActive;

    // Soft delete in DB
    await this.repository.softDelete(resumeId, userId);

    // Delete file from Storage Provider asynchronously/safely
    try {
      await this.storageService.deleteFile(resume.storagePublicId);
    } catch {
      // Storage deletion failure shouldn't crash audit DB soft delete
    }

    // If active resume was deleted, automatically promote latest remaining resume
    if (wasActive) {
      const latestRemaining = await this.repository.findLatestNonDeleted(userId);
      if (latestRemaining) {
        await this.repository.setActiveResume(latestRemaining._id.toString(), userId);
      }
    }
  }
}
