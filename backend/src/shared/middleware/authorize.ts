import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { ForbiddenError } from '../errors/ApiError';

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
    next();
  };
};
