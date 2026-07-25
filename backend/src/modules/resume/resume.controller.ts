import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { BadRequestError } from '../../shared/errors/ApiError';
import { StorageFile } from '../../shared/storage/types';
import { ResumeService } from './resume.service';
import { RESUME_MESSAGES } from './resume.constants';

export class ResumeController {
  private resumeService: ResumeService;

  constructor() {
    this.resumeService = new ResumeService();
  }

  uploadResume = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const expressFile = req.file;

    if (!expressFile) {
      throw new BadRequestError('No file uploaded');
    }

    const storageFile: StorageFile = {
      originalname: expressFile.originalname,
      mimetype: expressFile.mimetype,
      size: expressFile.size,
      buffer: expressFile.buffer,
    };

    const resume = await this.resumeService.uploadResume(userId, storageFile);

    res.status(201).json(ApiResponse.success(RESUME_MESSAGES.UPLOAD_SUCCESS, { resume }));
  });

  replaceResume = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const expressFile = req.file;

    if (!expressFile) {
      throw new BadRequestError('No file uploaded');
    }

    const storageFile: StorageFile = {
      originalname: expressFile.originalname,
      mimetype: expressFile.mimetype,
      size: expressFile.size,
      buffer: expressFile.buffer,
    };

    const resume = await this.resumeService.replaceResume(userId, storageFile);

    res.status(200).json(ApiResponse.success(RESUME_MESSAGES.REPLACE_SUCCESS, { resume }));
  });

  getActiveResume = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const resume = await this.resumeService.getActiveResume(userId);

    res.status(200).json(ApiResponse.success(RESUME_MESSAGES.GET_ACTIVE_SUCCESS, { resume }));
  });

  getResumeHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const resumes = await this.resumeService.getResumeHistory(userId);

    res.status(200).json(ApiResponse.success(RESUME_MESSAGES.GET_HISTORY_SUCCESS, { resumes }));
  });

  setActiveResume = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const resume = await this.resumeService.setActiveResume(userId, id as string);

    res.status(200).json(ApiResponse.success(RESUME_MESSAGES.SET_ACTIVE_SUCCESS, { resume }));
  });

  deleteResume = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await this.resumeService.deleteResume(userId, id as string);

    res.status(200).json(ApiResponse.success(RESUME_MESSAGES.DELETE_SUCCESS));
  });
}
