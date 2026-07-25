export const JOB_INPUT_CONSTANTS = {
  ALLOWED_MIME_TYPES: ['application/pdf'],
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
} as const;

export const JOB_INPUT_MESSAGES = {
  FILE_MISSING: 'No file provided for extraction',
  INVALID_FILE_FORMAT: 'Only PDF files are allowed for job description extraction',
  EMPTY_EXTRACTED_TEXT: 'No extractable text was found in this PDF',
  EXTRACT_SUCCESS: 'Job description text extracted',
} as const;
