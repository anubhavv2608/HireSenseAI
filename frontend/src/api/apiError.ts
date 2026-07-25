import { AxiosError } from "axios";
import type { ApiEnvelope, FieldError } from "@/types/api.types";

export class ApiError extends Error {
  readonly status: number | null;
  readonly fieldErrors: FieldError[] | null;
  readonly isNetworkError: boolean;

  constructor(options: {
    message: string;
    status: number | null;
    fieldErrors?: FieldError[] | null;
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? null;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function parseApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError({
        message: "Unable to reach the server. Check your connection and try again.",
        status: null,
        isNetworkError: true,
      });
    }

    const envelope = error.response.data as ApiEnvelope<unknown> | undefined;
    const fieldErrors = Array.isArray(envelope?.errors) ? envelope.errors : null;

    return new ApiError({
      message: envelope?.message ?? error.message ?? "Something went wrong.",
      status: error.response.status,
      fieldErrors,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Something went wrong.",
    status: null,
  });
}
