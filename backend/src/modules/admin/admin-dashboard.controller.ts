import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { AdminDashboardService } from './admin-dashboard.service';
import { ADMIN_MESSAGES } from './admin.constants';

export class AdminDashboardController {
  private service: AdminDashboardService;

  constructor() {
    this.service = new AdminDashboardService();
  }

  getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const summary = await this.service.getDashboard();
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.DASHBOARD_FETCHED, summary));
  });
}
