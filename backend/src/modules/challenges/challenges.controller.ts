import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { PaginationQuery } from '../../shared/types';
import { ChallengesService } from './challenges.service';
import { CHALLENGES_MESSAGES } from './challenges.constants';
import { ChallengeListType, ChallengeProblemInput } from './challenges.types';

export class ChallengesController {
  private service: ChallengesService;

  constructor() {
    this.service = new ChallengesService();
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const { opponentUserId, problem } = req.body as { opponentUserId: string; problem: ChallengeProblemInput };
    const challenge = await this.service.createChallenge(req.user!.userId, opponentUserId, problem);

    res.status(201).json(ApiResponse.success(CHALLENGES_MESSAGES.CREATED, { challenge }));
  });

  accept = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.service.acceptChallenge(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.ACCEPTED, { challenge }));
  });

  decline = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.service.declineChallenge(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.DECLINED, { challenge }));
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.service.cancelChallenge(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.CANCELLED, { challenge }));
  });

  complete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.service.completeChallenge(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.COMPLETED, { challenge }));
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.service.getChallenge(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.DETAIL_FETCHED, { challenge }));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const { type, ...pagination } = req.query as unknown as PaginationQuery & { type: ChallengeListType };
    const result = await this.service.listChallenges(req.user!.userId, type, pagination);

    res.status(200).json(ApiResponse.success(CHALLENGES_MESSAGES.FETCHED, result));
  });
}
