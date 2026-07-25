import { ApiError as GeminiApiError } from '@google/genai';
import { AppError } from '../../errors/AppError';
import {
  BadRequestError,
  GatewayTimeoutError,
  InternalServerError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../errors/ApiError';
import { AI_MESSAGES } from '../constants';
import { logger } from '../../config/logger';

const isTimeoutLikeError = (error: Error): boolean =>
  error.name === 'AbortError' || /timeout/i.test(error.message);

export const mapProviderError = (error: unknown): AppError => {
  logger.error(
    `[AI Provider Error] ${
      error instanceof GeminiApiError
        ? `status=${error.status} message=${error.message}`
        : error instanceof Error
          ? `${error.name}: ${error.message}`
          : 'Unknown AI provider error'
    }`
  );

  if (error instanceof GeminiApiError) {
    switch (error.status) {
      case 400:
        return new BadRequestError(AI_MESSAGES.GENERATION_FAILED);
      case 401:
      case 403:
        return new UnauthorizedError(AI_MESSAGES.AUTH_FAILED);
      case 429:
        return new TooManyRequestsError(AI_MESSAGES.RATE_LIMITED);
      case 503:
        return new ServiceUnavailableError(AI_MESSAGES.PROVIDER_UNAVAILABLE);
      case 504:
        return new GatewayTimeoutError(AI_MESSAGES.TIMEOUT);
      default:
        return new InternalServerError(AI_MESSAGES.GENERATION_FAILED);
    }
  }

  if (error instanceof Error && isTimeoutLikeError(error)) {
    return new GatewayTimeoutError(AI_MESSAGES.TIMEOUT);
  }

  return new InternalServerError(AI_MESSAGES.GENERATION_FAILED);
};

export const isRetryableError = (error: unknown): boolean =>
  error instanceof TooManyRequestsError ||
  error instanceof ServiceUnavailableError ||
  error instanceof GatewayTimeoutError;
