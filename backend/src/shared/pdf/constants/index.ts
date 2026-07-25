export const PDF_CONSTANTS = {
  DEFAULT_TIMEOUT_MS: 30_000,
} as const;

export const PDF_MESSAGES = {
  EMPTY_BUFFER: 'No PDF buffer provided for extraction',
  PARSE_TIMEOUT: 'PDF parsing timed out',
  ENCRYPTED_PDF: 'PDF is password protected and cannot be parsed',
  CORRUPTED_PDF: 'PDF file is corrupted or not a valid PDF',
  EXTRACTION_FAILED: 'Failed to extract text from PDF',
} as const;
