import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { RESUME_PROCESSING_MESSAGES } from './resume-processing.constants';
import { ResumeProcessingService } from './resume-processing.service';

export class ResumeProcessingController {
  private service: ResumeProcessingService;

  constructor() {
    this.service = new ResumeProcessingService();
  }

  process = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const processing = await this.service.processResume(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(RESUME_PROCESSING_MESSAGES.PROCESS_SUCCESS, { processing }));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const status = await this.service.getStatus(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_PROCESSING_MESSAGES.STATUS_FETCHED, { status }));
  });

  getRecord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const processing = await this.service.getRecord(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_PROCESSING_MESSAGES.RECORD_FETCHED, { processing }));
  });
}
