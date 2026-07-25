import { AuthRepository, AdminUserRow } from '../auth/auth.repository';
import { ResumeRepository } from '../resume/resume.repository';
import { IUserDocument } from '../auth/auth.schema';
import { NotFoundError } from '../../shared/errors/ApiError';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery, Role } from '../../shared/types';
import { ADMIN_MESSAGES } from './admin.constants';
import { AdminAuthorizationService, ActingUser } from './admin-authorization.service';

export interface AdminUserRowWithResume extends AdminUserRow {
  resumeStatus: string | null;
}

interface ListUsersQuery extends PaginationQuery {
  search?: string;
  sort?: 'newest' | 'oldest';
}

export class AdminUsersService {
  private authRepository: AuthRepository;
  private resumeRepository: ResumeRepository;
  private authorizationService: AdminAuthorizationService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.resumeRepository = new ResumeRepository();
    this.authorizationService = new AdminAuthorizationService();
  }

  private async getExistingUser(id: string): Promise<IUserDocument> {
    const user = await this.authRepository.findById(id);
    if (!user) {
      throw new NotFoundError(ADMIN_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async listUsers(query: ListUsersQuery): Promise<PaginatedResponse<AdminUserRowWithResume>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.authRepository.findAllAdmin({
      skip,
      limit,
      search: query.search,
      sort: query.sort,
    });

    const userIds = items.map((item) => item.userId);
    const resumeStatuses = await this.resumeRepository.findActiveStatusByUserIds(userIds);
    const statusByUserId = new Map(resumeStatuses.map((resume) => [resume.userId.toString(), resume.status]));

    const data: AdminUserRowWithResume[] = items.map((item) => ({
      ...item,
      resumeStatus: statusByUserId.get(item.userId) ?? null,
    }));

    return createPaginatedResponse(data, total, page, limit);
  }

  async setActive(id: string, isActive: boolean, actingUser: ActingUser): Promise<IUserDocument> {
    const target = await this.getExistingUser(id);
    this.authorizationService.assertCanModify(target, actingUser, 'toggle-active');

    const user = await this.authRepository.setActive(id, isActive);
    if (!user) {
      throw new NotFoundError(ADMIN_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async softDeleteUser(id: string, actingUser: ActingUser): Promise<IUserDocument> {
    const target = await this.getExistingUser(id);
    this.authorizationService.assertCanModify(target, actingUser, 'delete');

    const user = await this.authRepository.softDelete(id);
    if (!user) {
      throw new NotFoundError(ADMIN_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async changeRole(id: string, role: Role, actingUser: ActingUser): Promise<IUserDocument> {
    const target = await this.getExistingUser(id);
    this.authorizationService.assertCanModify(target, actingUser, 'role-change');

    await this.authRepository.updateRole(id, role);
    return this.getExistingUser(id);
  }
}
