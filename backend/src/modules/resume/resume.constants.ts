export const RESUME_CONSTANTS = {
  ALLOWED_MIME_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf'],
  DEFAULT_STORAGE_FOLDER: 'resumes',
} as const;

export const RESUME_MESSAGES = {
  UPLOAD_SUCCESS: 'Resume uploaded successfully',
  REPLACE_SUCCESS: 'Resume replaced successfully',
  GET_ACTIVE_SUCCESS: 'Current active resume retrieved successfully',
  GET_HISTORY_SUCCESS: 'Resume history retrieved successfully',
  SET_ACTIVE_SUCCESS: 'Active resume updated successfully',
  DELETE_SUCCESS: 'Resume deleted successfully',
  RESUME_NOT_FOUND: 'Resume not found',
  INVALID_FILE_FORMAT: 'Only PDF files are allowed for resume upload',
} as const;
