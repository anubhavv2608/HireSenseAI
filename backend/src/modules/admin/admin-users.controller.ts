import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { logger } from '../../shared/config/logger';
import { AdminUsersService } from './admin-users.service';
import { ADMIN_MESSAGES } from './admin.constants';
import { Role } from '../../shared/types';

export class AdminUsersController {
  private service: AdminUsersService;

  constructor() {
    this.service = new AdminUsersService();
  }

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, sort } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      sort?: 'newest' | 'oldest';
    };
    const result = await this.service.listUsers({
      page: page as unknown as number,
      limit: limit as unknown as number,
      search,
      sort,
    });
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.USERS_FETCHED, result));
  });

  setActive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body as { isActive: boolean };
    const actingUser = { userId: req.user!.userId, role: req.user!.role };
    const user = await this.service.setActive(id as string, isActive, actingUser);
    logger.info(`[Admin] User ${isActive ? 'enabled' : 'disabled'} [UserID: ${id}] [AdminID: ${req.user!.userId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.USER_UPDATED, { user }));
  });

  softDeleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const actingUser = { userId: req.user!.userId, role: req.user!.role };
    await this.service.softDeleteUser(id as string, actingUser);
    logger.info(`[Admin] User soft-deleted [UserID: ${id}] [AdminID: ${req.user!.userId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.USER_DELETED));
  });

  changeRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body as { role: Role };
    const actingUser = { userId: req.user!.userId, role: req.user!.role };
    const user = await this.service.changeRole(id as string, role, actingUser);
    logger.info(`[Admin] Role changed to ${role} [UserID: ${id}] [ActorID: ${req.user!.userId}]`);
    res.status(200).json(ApiResponse.success(ADMIN_MESSAGES.USER_ROLE_UPDATED, { user }));
  });
}
