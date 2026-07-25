import { Schema, model, Document, Types } from 'mongoose';
import { FRIEND_REQUEST_STATUSES } from './friends.constants';
import { FriendRequestStatus } from './friends.types';

export interface IFriendRequestDocument extends Document {
  requesterId: Types.ObjectId;
  recipientId: Types.ObjectId;
  status: FriendRequestStatus;
  respondedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequestDocument>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: FRIEND_REQUEST_STATUSES, default: 'pending', index: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Not unique: a past rejected/cancelled row must not block a new request between
// the same pair — the service layer checks for an existing pending/accepted row
// (via findBetween) before allowing a new send.
friendRequestSchema.index({ requesterId: 1, recipientId: 1 });
// Backs the "incoming requests" list (recipientId + status, newest first).
friendRequestSchema.index({ recipientId: 1, status: 1, createdAt: -1 });

export const FriendRequestModel = model<IFriendRequestDocument>('FriendRequest', friendRequestSchema);
