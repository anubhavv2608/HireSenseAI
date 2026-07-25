import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { JD_ANALYSIS_MESSAGES } from './job-description-analysis.constants';
import { JobDescriptionAnalysisService } from './job-description-analysis.service';

export class JobDescriptionAnalysisController {
  private service: JobDescriptionAnalysisService;

  constructor() {
    this.service = new JobDescriptionAnalysisService();
  }

  analyze = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId, jobDescription } = req.body as { resumeId: string; jobDescription: string };

    const analysis = await this.service.analyzeResume(userId, resumeId, jobDescription, req.id);

    res.status(200).json(ApiResponse.success(JD_ANALYSIS_MESSAGES.ANALYZE_SUCCESS, { analysis }));
  });

  reanalyze = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId, jobDescription } = req.body as { resumeId: string; jobDescription: string };

    const analysis = await this.service.reanalyzeResume(userId, resumeId, jobDescription, req.id);

    res.status(200).json(ApiResponse.success(JD_ANALYSIS_MESSAGES.ANALYZE_SUCCESS, { analysis }));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const status = await this.service.getStatus(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(JD_ANALYSIS_MESSAGES.STATUS_FETCHED, { status }));
  });

  getRecord = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { resumeId } = req.params;

    const analysis = await this.service.getRecord(userId, resumeId as string);

    res.status(200).json(ApiResponse.success(JD_ANALYSIS_MESSAGES.RECORD_FETCHED, { analysis }));
  });
}
