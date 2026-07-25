import { NotificationModel, INotificationDocument } from './notification.schema';
import { CreateNotificationInput } from './notifications.types';

export interface FindPaginatedOptions {
  skip: number;
  limit: number;
  unreadOnly?: boolean;
}

export class NotificationsRepository {
  async create(input: CreateNotificationInput): Promise<INotificationDocument> {
    return NotificationModel.create({
      recipientId: input.recipientId,
      type: input.type,
      actorId: input.actorId ?? null,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      metadata: input.metadata ?? null,
    });
  }

  async findPaginated(
    recipientId: string,
    { skip, limit, unreadOnly }: FindPaginatedOptions
  ): Promise<{ items: INotificationDocument[]; total: number }> {
    const filter: Record<string, unknown> = { recipientId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [items, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotificationModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async countUnread(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({ recipientId, isRead: false });
  }

  async markRead(id: string, recipientId: string): Promise<INotificationDocument | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: id, recipientId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  }

  async markAllRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany({ recipientId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
  }

  /** Deletes the oldest already-read notifications beyond `maxCount`, restricted
   * to rows older than `minAgeDays` so a same-day burst or anything still unread
   * is never silently deleted out from under the user. */
  async pruneOverflow(recipientId: string, maxCount: number, minAgeDays: number): Promise<void> {
    const total = await NotificationModel.countDocuments({ recipientId });
    const overflow = total - maxCount;
    if (overflow <= 0) return;

    const cutoff = new Date(Date.now() - minAgeDays * 24 * 60 * 60 * 1000);
    const candidates = await NotificationModel.find({ recipientId, isRead: true, createdAt: { $lt: cutoff } })
      .sort({ createdAt: 1 })
      .limit(overflow)
      .select('_id');

    if (candidates.length === 0) return;
    await NotificationModel.deleteMany({ _id: { $in: candidates.map((doc) => doc._id) } });
  }
}
