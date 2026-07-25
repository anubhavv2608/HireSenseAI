export interface RetryOptions {
  maxRetries: number;
  isRetryable: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
  baseDelayMs?: number;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const executeWithRetry = async <T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === options.maxRetries || !options.isRetryable(error)) {
        throw error;
      }

      options.onRetry?.(attempt + 1, error);
      await sleep((options.baseDelayMs ?? 250) * (attempt + 1));
    }
  }

  throw lastError;
};
