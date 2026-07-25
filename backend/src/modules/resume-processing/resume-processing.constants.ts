export const PROCESSING_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED_DUPLICATE: 'SKIPPED_DUPLICATE',
} as const;

export const RESUME_PROCESSING_CONSTANTS = {
  STORAGE_RESOURCE_TYPE: 'raw',
  CURRENT_PROCESSING_VERSION: 1,
} as const;

export const RESUME_PROCESSING_MESSAGES = {
  RESUME_NOT_FOUND: 'Resume not found',
  RESUME_NOT_ACTIVE: 'Only the active resume can be processed',
  ALREADY_PROCESSING: 'Resume is already being processed',
  STORAGE_FILE_MISSING: 'Resume file could not be found in storage',
  PROCESSING_NOT_FOUND: 'No processing record found for this resume',
  PROCESSING_FAILED: 'Failed to process resume',
  PROCESS_SUCCESS: 'Resume processing completed',
  STATUS_FETCHED: 'Processing status retrieved',
  RECORD_FETCHED: 'Processing record retrieved',
} as const;
