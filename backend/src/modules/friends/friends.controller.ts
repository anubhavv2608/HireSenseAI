import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { PaginationQuery } from '../../shared/types';
import { FriendsService } from './friends.service';
import { FRIENDS_MESSAGES } from './friends.constants';
import { FriendRequestListType, FriendsListQuery } from './friends.types';

export class FriendsController {
  private service: FriendsService;

  constructor() {
    this.service = new FriendsService();
  }

  sendRequest = asyncHandler(async (req: Request, res: Response) => {
    const { targetUserId } = req.body as { targetUserId: string };
    const request = await this.service.sendRequest(req.user!.userId, targetUserId);

    res.status(201).json(ApiResponse.success(FRIENDS_MESSAGES.REQUEST_SENT, { request }));
  });

  acceptRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await this.service.acceptRequest(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.REQUEST_ACCEPTED, { request }));
  });

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await this.service.rejectRequest(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.REQUEST_REJECTED, { request }));
  });

  cancelRequest = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await this.service.cancelRequest(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.REQUEST_CANCELLED, { request }));
  });

  removeFriend = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await this.service.removeFriend(req.user!.userId, userId as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.FRIEND_REMOVED));
  });

  listFriends = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.listFriends(req.user!.userId, req.query as unknown as FriendsListQuery);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.FRIENDS_FETCHED, result));
  });

  listRequests = asyncHandler(async (req: Request, res: Response) => {
    const { type, ...pagination } = req.query as unknown as PaginationQuery & { type: FriendRequestListType };
    const result = await this.service.listRequests(req.user!.userId, type, pagination);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.REQUESTS_FETCHED, result));
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await this.service.getStatus(req.user!.userId, userId as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.STATUS_FETCHED, result));
  });

  getMutualCount = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const count = await this.service.getMutualCount(req.user!.userId, userId as string);

    res.status(200).json(ApiResponse.success(FRIENDS_MESSAGES.MUTUAL_FETCHED, { count }));
  });
}
