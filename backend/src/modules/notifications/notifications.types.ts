import { PaginationQuery } from '../../shared/types';
import { NOTIFICATION_TYPES } from './notifications.constants';

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  actorId?: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListQuery extends PaginationQuery {
  unreadOnly?: boolean;
}
