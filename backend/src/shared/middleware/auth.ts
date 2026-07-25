import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../errors/ApiError';
import { Role } from '../types';

interface TokenPayload {
  userId: string;
  email: string;
  role?: Role;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] }) as TokenPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role ?? 'student',
    };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};
