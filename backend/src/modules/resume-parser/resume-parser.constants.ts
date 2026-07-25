export const PARSING_STATUS = {
  PENDING: 'PENDING',
  PARSING: 'PARSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED_ALREADY_PARSED: 'SKIPPED_ALREADY_PARSED',
} as const;

export const RESUME_PARSER_CONSTANTS = {
  CURRENT_PARSING_VERSION: 1,
  CURRENT_PROMPT_VERSION: 1,
  TEMPERATURE: 0,
} as const;

export const RESUME_PARSER_MESSAGES = {
  RESUME_NOT_FOUND: 'Resume not found',
  RESUME_NOT_ACTIVE: 'Only the active resume can be parsed',
  PROCESSING_NOT_COMPLETED: 'Resume processing has not completed successfully yet',
  MISSING_NORMALIZED_TEXT: 'No extracted text is available for this resume',
  ALREADY_PARSING: 'Resume is already being parsed',
  PARSE_NOT_FOUND: 'No parse record found for this resume',
  VALIDATION_FAILED: 'AI response did not match the expected resume structure',
  PARSING_FAILED: 'Failed to parse resume',
  PARSE_SUCCESS: 'Resume parsing completed',
  STATUS_FETCHED: 'Parsing status retrieved',
  RECORD_FETCHED: 'Parse record retrieved',
} as const;
