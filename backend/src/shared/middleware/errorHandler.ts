import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../config/logger';
import { config } from '../config';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error instanceof Error && 'statusCode' in error ? Number(error.statusCode) : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  const { statusCode, message } = error as AppError;

  if (config.env !== 'test') {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message} [ReqID: ${req.id}]`);
  }

  // Include validation issues if they exist
  const errors =
    error && typeof error === 'object' && 'issues' in error
      ? (error as Record<string, unknown>).issues
      : config.env === 'development' && err instanceof Error
        ? err.stack
        : null;

  const response = ApiResponse.error(message, errors);

  res.status(statusCode).json(response);
};
