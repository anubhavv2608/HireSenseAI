export const CHALLENGE_STATUSES = ['pending', 'accepted', 'declined', 'cancelled', 'completed'] as const;
export const CHALLENGE_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;
export const CHALLENGE_LIST_TYPES = ['incoming', 'outgoing', 'active', 'completed'] as const;

export const CHALLENGES_MESSAGES = {
  CREATED: 'Challenge sent',
  ACCEPTED: 'Challenge accepted',
  DECLINED: 'Challenge declined',
  CANCELLED: 'Challenge cancelled',
  COMPLETED: 'Challenge marked as complete',
  FETCHED: 'Challenges retrieved successfully',
  DETAIL_FETCHED: 'Challenge retrieved successfully',
  NOT_FOUND: 'Challenge not found',
  USER_NOT_FOUND: 'User not found',
  CANNOT_CHALLENGE_SELF: 'You cannot challenge yourself',
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
  NOT_ACCEPTED: 'This challenge must be accepted before it can be completed',
  ALREADY_COMPLETED_BY_YOU: 'You already marked this challenge as complete',
} as const;
