import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { StatisticsService } from './statistics.service';
import { STATISTICS_MESSAGES } from './statistics.constants';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

  getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const statistics = await this.service.getStatistics(userId);
    res.status(200).json(ApiResponse.success(STATISTICS_MESSAGES.STATS_FETCHED, { statistics }));
  });
}
