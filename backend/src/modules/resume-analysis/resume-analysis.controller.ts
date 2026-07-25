import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { RESUME_ANALYSIS_MESSAGES } from './resume-analysis.constants';
import { ResumeAnalysisService } from './resume-analysis.service';

export class ResumeAnalysisController {
  private service: ResumeAnalysisService;

  constructor() {
    this.service = new ResumeAnalysisService();
  }

  analyze = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const analysis = await this.service.analyzeResume(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(RESUME_ANALYSIS_MESSAGES.ANALYZE_SUCCESS, { analysis }));
  });

  reanalyze = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.body as { resumeId: string };

    const analysis = await this.service.reanalyzeResume(userId, resumeId, req.id);

    res.status(200).json(ApiResponse.success(RESUME_ANALYSIS_MESSAGES.ANALYZE_SUCCESS, { analysis }));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const status = await this.service.getStatus(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_ANALYSIS_MESSAGES.STATUS_FETCHED, { status }));
  });

  getRecord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const analysis = await this.service.getRecord(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(RESUME_ANALYSIS_MESSAGES.RECORD_FETCHED, { analysis }));
  });
}
