import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/ApiError';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: unknown };

      // Zod coerces/transforms values (e.g. query strings -> numbers/arrays), so the
      // parsed result must replace the raw request data or downstream code silently
      // receives un-coerced strings. Express 5 makes `req.query` a getter-only
      // accessor, so it must be overridden via defineProperty rather than assigned.
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;
      if (parsed.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsed.query,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        const validationError = new ValidationError('Validation failed');
        Object.assign(validationError, { issues });

        next(validationError);
      } else {
        next(error);
      }
    }
  };
};
