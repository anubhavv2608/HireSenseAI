export const ANALYSIS_STATUS = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED_ALREADY_ANALYZED: 'SKIPPED_ALREADY_ANALYZED',
} as const;

export const RESUME_ANALYSIS_CONSTANTS = {
  CURRENT_ANALYSIS_VERSION: 1,
  CURRENT_PROMPT_VERSION: 1,
} as const;

export const RESUME_ANALYSIS_MESSAGES = {
  RESUME_NOT_FOUND: 'Resume not found',
  RESUME_NOT_ACTIVE: 'Only the active resume can be analyzed',
  PARSE_NOT_COMPLETED: 'Resume parsing has not completed successfully yet',
  ALREADY_ANALYZING: 'Resume is already being analyzed',
  ANALYSIS_NOT_FOUND: 'No analysis record found for this resume',
  VALIDATION_FAILED: 'AI response did not match the expected analysis structure',
  ANALYSIS_FAILED: 'Failed to analyze resume',
  ANALYZE_SUCCESS: 'Resume analysis completed',
  STATUS_FETCHED: 'Analysis status retrieved',
  RECORD_FETCHED: 'Analysis record retrieved',
} as const;
