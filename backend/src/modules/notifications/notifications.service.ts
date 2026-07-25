import { logger } from '../../shared/config/logger';
import { NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse } from '../../shared/types';
import { NotificationsRepository } from './notifications.repository';
import { NOTIFICATION_CONSTANTS, NOTIFICATION_MESSAGES } from './notifications.constants';
import { CreateNotificationInput, NotificationListQuery } from './notifications.types';
import { INotificationDocument } from './notification.schema';

export class NotificationsService {
  private repository: NotificationsRepository;

  constructor() {
    this.repository = new NotificationsRepository();
  }

  async create(input: CreateNotificationInput): Promise<INotificationDocument> {
    const notification = await this.repository.create(input);

    // Fire-and-forget: retention cleanup must never delay or fail the caller's
    // primary action (e.g. accepting a friend request).
    void this.repository
      .pruneOverflow(input.recipientId, NOTIFICATION_CONSTANTS.MAX_PER_RECIPIENT, NOTIFICATION_CONSTANTS.RETENTION_DAYS)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[Notifications] Prune failed [RecipientID: ${input.recipientId}]: ${message}`);
      });

    return notification;
  }

  async list(recipientId: string, query: NotificationListQuery): Promise<PaginatedResponse<INotificationDocument>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.findPaginated(recipientId, {
      skip,
      limit,
      unreadOnly: query.unreadOnly,
    });
    return createPaginatedResponse(items, total, page, limit);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.repository.countUnread(recipientId);
  }

  async markRead(recipientId: string, id: string): Promise<INotificationDocument> {
    const updated = await this.repository.markRead(id, recipientId);
    if (!updated) {
      throw new NotFoundError(NOTIFICATION_MESSAGES.NOT_FOUND);
    }
    return updated;
  }

  async markAllRead(recipientId: string): Promise<void> {
    await this.repository.markAllRead(recipientId);
  }
}
