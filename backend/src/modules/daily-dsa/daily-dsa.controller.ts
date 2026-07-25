import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { PaginationQuery } from '../../shared/types';
import { DailyDsaService } from './daily-dsa.service';
import { DAILY_DSA_MESSAGES } from './daily-dsa.constants';

export class DailyDsaController {
  private service: DailyDsaService;

  constructor() {
    this.service = new DailyDsaService();
  }

  getToday = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.service.getToday(userId);
    res.status(200).json(ApiResponse.success(DAILY_DSA_MESSAGES.TODAY_FETCHED, result));
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.service.getHistory(userId, req.query as unknown as PaginationQuery);
    res.status(200).json(ApiResponse.success(DAILY_DSA_MESSAGES.HISTORY_FETCHED, result));
  });

  complete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { assignmentId } = req.body as { assignmentId: string };
    const result = await this.service.completeAssignment(userId, assignmentId, req.id);
    res.status(200).json(ApiResponse.success(DAILY_DSA_MESSAGES.COMPLETE_SUCCESS, result));
  });

  enable = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await this.service.enableDailyDsa(userId);
    res.status(200).json(ApiResponse.success(DAILY_DSA_MESSAGES.ENABLE_SUCCESS, { user }));
  });
}
