import { Schema, model, Document, Types } from 'mongoose';
import { NOTIFICATION_TYPES } from './notifications.constants';
import { NotificationType } from './notifications.types';

export interface INotificationDocument extends Document {
  recipientId: Types.ObjectId;
  type: NotificationType;
  actorId?: Types.ObjectId | null;
  title: string;
  message: string;
  link?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<INotificationDocument>('Notification', notificationSchema);
