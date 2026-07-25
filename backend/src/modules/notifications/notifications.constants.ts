export const NOTIFICATION_TYPES = [
  'friend_request',
  'friend_accepted',
  'challenge_received',
  'challenge_accepted',
  'challenge_declined',
  'challenge_completed',
  'system',
] as const;

export const NOTIFICATION_CONSTANTS = {
  MAX_PER_RECIPIENT: 200,
  RETENTION_DAYS: 7,
} as const;

export const NOTIFICATION_MESSAGES = {
  FETCHED: 'Notifications retrieved successfully',
  UNREAD_COUNT_FETCHED: 'Unread count retrieved successfully',
  MARKED_READ: 'Notification marked as read',
  ALL_MARKED_READ: 'All notifications marked as read',
  NOT_FOUND: 'Notification not found',
} as const;
