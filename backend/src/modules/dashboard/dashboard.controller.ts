import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { DASHBOARD_MESSAGES } from './dashboard.constants';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const dashboard = await this.service.getDashboard(userId, req.id);

    res.status(200).json(ApiResponse.success(DASHBOARD_MESSAGES.DASHBOARD_FETCHED, { dashboard }));
  });
}
