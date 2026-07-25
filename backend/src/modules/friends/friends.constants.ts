export const FRIEND_REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'] as const;

export const FRIENDS_MESSAGES = {
  REQUEST_SENT: 'Friend request sent',
  REQUEST_ACCEPTED: 'Friend request accepted',
  REQUEST_REJECTED: 'Friend request rejected',
  REQUEST_CANCELLED: 'Friend request cancelled',
  FRIEND_REMOVED: 'Friend removed',
  FRIENDS_FETCHED: 'Friends retrieved successfully',
  REQUESTS_FETCHED: 'Friend requests retrieved successfully',
  STATUS_FETCHED: 'Friend status retrieved successfully',
  MUTUAL_FETCHED: 'Mutual friends count retrieved successfully',
  REQUEST_NOT_FOUND: 'Friend request not found',
  USER_NOT_FOUND: 'User not found',
  CANNOT_FRIEND_SELF: 'You cannot send a friend request to yourself',
  ALREADY_FRIENDS: 'You are already friends with this user',
  REQUEST_ALREADY_PENDING: 'A friend request is already pending between you and this user',
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
} as const;
