import { Role } from '../../shared/types';
import { ROLES } from '../../shared/constants/roles';
import { BadRequestError, ForbiddenError } from '../../shared/errors/ApiError';
import { IUserDocument } from '../auth/auth.schema';
import { ADMIN_MESSAGES } from './admin.constants';

export interface ActingUser {
  userId: string;
  role: Role;
}

export type AdminModifyAction = 'toggle-active' | 'delete' | 'role-change';

export class AdminAuthorizationService {
  assertCanModify(target: IUserDocument, actingUser: ActingUser, action: AdminModifyAction): void {
    if (target._id.toString() === actingUser.userId) {
      throw new BadRequestError(ADMIN_MESSAGES.CANNOT_MODIFY_SELF);
    }

    if (actingUser.role === ROLES.ADMIN) {
      if (target.role === ROLES.SUPER_ADMIN) {
        throw new ForbiddenError(ADMIN_MESSAGES.CANNOT_MODIFY_SUPER_ADMIN);
      }

      if (action === 'role-change' && target.role === ROLES.ADMIN) {
        throw new ForbiddenError(ADMIN_MESSAGES.CANNOT_MODIFY_ADMIN_ROLE);
      }
    }
  }
}
