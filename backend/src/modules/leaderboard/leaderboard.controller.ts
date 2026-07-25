import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { LeaderboardService } from './leaderboard.service';
import { LEADERBOARD_MESSAGES } from './leaderboard.constants';
import { LeaderboardQuery } from './leaderboard.types';

export class LeaderboardController {
  private service: LeaderboardService;

  constructor() {
    this.service = new LeaderboardService();
  }

  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.service.getLeaderboard(userId, req.query as unknown as LeaderboardQuery);
    res.status(200).json(ApiResponse.success(LEADERBOARD_MESSAGES.LEADERBOARD_FETCHED, result));
  });
}
