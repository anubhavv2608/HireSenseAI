export const API_PREFIX = '/api/v1';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SUPPORTED_FILE_TYPES = {
  RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Invalid data provided.',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;
