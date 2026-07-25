import 'express';
import { Role } from './index';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}
