export const STORAGE_CONSTANTS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB default
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpeg', '.jpg', '.png', '.webp'],
} as const;

export const STORAGE_MESSAGES = {
  FILE_MISSING: 'No file provided for upload',
  FILE_TOO_LARGE: 'File size exceeds maximum allowed limit',
  INVALID_MIME_TYPE: 'Invalid file MIME type',
  INVALID_EXTENSION: 'Invalid file extension',
  FILE_CONTENT_MISMATCH: "File content doesn't match its declared type",
  UPLOAD_FAILED: 'Failed to upload file to storage provider',
  DOWNLOAD_FAILED: 'Failed to download file from storage provider',
  DELETE_FAILED: 'Failed to delete file from storage provider',
  INVALID_PUBLIC_ID: 'Invalid or missing storage public ID',
} as const;
