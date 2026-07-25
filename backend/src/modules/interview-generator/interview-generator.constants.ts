export const GENERATION_STATUS = {
  PENDING: 'PENDING',
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED_ALREADY_GENERATED: 'SKIPPED_ALREADY_GENERATED',
} as const;

export const INTERVIEW_GENERATOR_CONSTANTS = {
  CURRENT_GENERATION_VERSION: 1,
  CURRENT_PROMPT_VERSION: 1,
} as const;

export const INTERVIEW_GENERATOR_MESSAGES = {
  RESUME_NOT_FOUND: 'Resume not found',
  RESUME_NOT_ACTIVE: 'Only the active resume can be used to generate interview questions',
  PARSE_NOT_COMPLETED: 'Resume parsing has not completed successfully yet',
  ALREADY_GENERATING: 'Interview questions are already being generated for this resume',
  GENERATION_NOT_FOUND: 'No interview generation found for this resume',
  VALIDATION_FAILED: 'AI response did not match the expected interview generation structure',
  GENERATION_FAILED: 'Failed to generate interview questions',
  GENERATE_SUCCESS: 'Interview questions generated',
  STATUS_FETCHED: 'Generation status retrieved',
  RECORD_FETCHED: 'Generation record retrieved',
} as const;
