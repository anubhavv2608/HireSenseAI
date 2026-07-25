import { PaginationQuery } from '../../shared/types';
import { FRIEND_REQUEST_STATUSES } from './friends.constants';

export type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUSES)[number];

export type FriendStatus = 'self' | 'friends' | 'pending_outgoing' | 'pending_incoming' | 'none';

export type FriendRequestListType = 'incoming' | 'outgoing';

export interface FriendCardDTO {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: { publicId: string; url: string };
  college?: string;
  branch?: string;
}

export interface FriendRequestDTO {
  id: string;
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: { publicId: string; url: string };
  createdAt: Date;
}

export interface FriendsListQuery extends PaginationQuery {
  search?: string;
}
