import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { NotificationsService } from './notifications.service';
import { NOTIFICATION_MESSAGES } from './notifications.constants';
import { NotificationListQuery } from './notifications.types';

export class NotificationsController {
  private service: NotificationsService;

  constructor() {
    this.service = new NotificationsService();
  }

  list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await this.service.list(userId, req.query as unknown as NotificationListQuery);

    res.status(200).json(ApiResponse.success(NOTIFICATION_MESSAGES.FETCHED, result));
  });

  unreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await this.service.getUnreadCount(req.user!.userId);

    res.status(200).json(ApiResponse.success(NOTIFICATION_MESSAGES.UNREAD_COUNT_FETCHED, { count }));
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await this.service.markRead(req.user!.userId, id as string);

    res.status(200).json(ApiResponse.success(NOTIFICATION_MESSAGES.MARKED_READ, { notification }));
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    await this.service.markAllRead(req.user!.userId);

    res.status(200).json(ApiResponse.success(NOTIFICATION_MESSAGES.ALL_MARKED_READ));
  });
}
