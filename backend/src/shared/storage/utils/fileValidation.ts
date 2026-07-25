import path from 'path';
import { BadRequestError } from '../../errors/ApiError';
import { STORAGE_CONSTANTS, STORAGE_MESSAGES } from '../constants';
import { StorageFile, UploadOptions } from '../types';
import { detectFileSignature } from './detectFileSignature';

export const validateFile = (file?: StorageFile, options?: UploadOptions): void => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new BadRequestError(STORAGE_MESSAGES.FILE_MISSING);
  }

  const maxSizeBytes = options?.maxSizeBytes || STORAGE_CONSTANTS.MAX_FILE_SIZE_BYTES;
  if (file.size > maxSizeBytes) {
    throw new BadRequestError(
      `${STORAGE_MESSAGES.FILE_TOO_LARGE}. Maximum allowed size is ${maxSizeBytes / (1024 * 1024)}MB.`
    );
  }

  const allowedMimeTypes = options?.allowedMimeTypes || (STORAGE_CONSTANTS.ALLOWED_MIME_TYPES as readonly string[]);
  if (!(allowedMimeTypes as readonly string[]).includes(file.mimetype)) {
    throw new BadRequestError(
      `${STORAGE_MESSAGES.INVALID_MIME_TYPE}. Allowed types: ${allowedMimeTypes.join(', ')}.`
    );
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!(STORAGE_CONSTANTS.ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
    throw new BadRequestError(
      `${STORAGE_MESSAGES.INVALID_EXTENSION}. Allowed extensions: ${STORAGE_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}.`
    );
  }

  const detectedMimeType = detectFileSignature(file.buffer);
  if (!detectedMimeType || detectedMimeType !== file.mimetype) {
    throw new BadRequestError(STORAGE_MESSAGES.FILE_CONTENT_MISMATCH);
  }
};
