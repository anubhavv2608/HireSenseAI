export const PROFILE_CONSTANTS = {
  MIN_CGPA: 0.0,
  MAX_CGPA: 10.0,
  MIN_GRADUATION_YEAR: 2000,
  MAX_GRADUATION_YEAR: 2100,
  ABOUT_MAX_LENGTH: 500,
  MAX_SKILLS: 20,
  MAX_SKILL_LENGTH: 30,
  SOCIAL_URL_MAX_LENGTH: 300,
  DEGREE_MAX_LENGTH: 100,
  PICTURE_MAX_SIZE_BYTES: 2 * 1024 * 1024,
  PICTURE_ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  PICTURE_STORAGE_FOLDER: 'profile-pictures',
} as const;

export const COLLEGE_TYPES = ['Government', 'Private', 'NIT', 'IIT', 'IIIT', 'Other'] as const;

export const SOCIAL_URL_DOMAINS = {
  github: 'github.com',
  linkedin: 'linkedin.com',
  leetcode: 'leetcode.com',
  codeforces: 'codeforces.com',
} as const;

export const PROFILE_MESSAGES = {
  CREATE_SUCCESS: 'Profile created successfully',
  GET_SUCCESS: 'Profile retrieved successfully',
  UPDATE_SUCCESS: 'Profile updated successfully',
  DELETE_SUCCESS: 'Profile deleted successfully',
  PROFILE_ALREADY_EXISTS: 'Profile already exists for this user',
  PROFILE_NOT_FOUND: 'Profile not found',
  SEARCH_SUCCESS: 'Students retrieved successfully',
  PICTURE_UPDATED: 'Profile picture updated successfully',
  PICTURE_REMOVED: 'Profile picture removed successfully',
  PICTURE_NOT_FOUND: 'No profile picture to remove',
  INVALID_URL: 'Invalid URL format',
} as const;
