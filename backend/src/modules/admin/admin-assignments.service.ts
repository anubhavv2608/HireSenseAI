import {
  DailyAssignmentRepository,
  CreateAssignmentData,
  UpdateAssignmentData,
} from '../daily-dsa/daily-dsa.assignment.repository';
import { IDailyAssignmentDocument } from '../daily-dsa/daily-dsa.assignment.schema';
import { Difficulty } from '../daily-dsa/daily-dsa.types';
import { ConflictError, NotFoundError } from '../../shared/errors/ApiError';
import { toUtcDayStart } from '../../shared/utils/date';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery } from '../../shared/types';
import { config } from '../../shared/config';
import { logger } from '../../shared/config/logger';
import { EmailService, dailyDsaEmail } from '../../shared/email';
import { AuthRepository } from '../auth/auth.repository';
import { ADMIN_MESSAGES } from './admin.constants';

interface AssignmentInput {
  title?: string;
  leetcodeProblemId?: string;
  leetcodeUrl?: string;
  difficulty?: Difficulty;
  topic?: string;
  description?: string;
  date?: Date | string;
}

export class AdminAssignmentsService {
  private repository: DailyAssignmentRepository;
  private authRepository: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.repository = new DailyAssignmentRepository();
    this.authRepository = new AuthRepository();
    this.emailService = new EmailService();
  }

  /** Fire-and-forget: emails every Daily-DSA-enabled, opted-in user about the
   * newly published problem. Never blocks or fails the publish action itself. */
  private sendDailyDsaEmails(assignment: IDailyAssignmentDocument): void {
    void this.authRepository
      .findDailyDsaEmailRecipients()
      .then((recipients) => {
        const dailyDsaUrl = `${config.cors.origin}/daily-dsa`;
        for (const recipient of recipients) {
          const { subject, html } = dailyDsaEmail(
            recipient.fullName ?? recipient.email,
            {
              title: assignment.title,
              leetcodeUrl: assignment.leetcodeUrl,
              difficulty: assignment.difficulty,
              topic: assignment.topic,
            },
            dailyDsaUrl
          );
          this.emailService.sendInBackground({ to: recipient.email, subject, html });
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[AdminAssignments] Failed to send Daily DSA emails [AssignmentID: ${assignment._id}]: ${message}`);
      });
  }

  async createAssignment(data: Required<AssignmentInput>, adminUserId: string): Promise<IDailyAssignmentDocument> {
    const createData: CreateAssignmentData = {
      title: data.title,
      leetcodeProblemId: data.leetcodeProblemId,
      leetcodeUrl: data.leetcodeUrl,
      difficulty: data.difficulty,
      topic: data.topic,
      description: data.description,
      date: toUtcDayStart(new Date(data.date)),
      createdBy: adminUserId,
    };
    return this.repository.create(createData);
  }

  async listAssignments(query: PaginationQuery): Promise<PaginatedResponse<IDailyAssignmentDocument>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.repository.findAllAdmin({ skip, limit });
    return createPaginatedResponse(items, total, page, limit);
  }

  async getAssignment(id: string): Promise<IDailyAssignmentDocument> {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundError(ADMIN_MESSAGES.ASSIGNMENT_NOT_FOUND);
    }
    return assignment;
  }

  async updateAssignment(
    id: string,
    data: AssignmentInput,
    adminUserId: string
  ): Promise<IDailyAssignmentDocument> {
    const assignment = await this.repository.findById(id);
    if (!assignment) {
      throw new NotFoundError(ADMIN_MESSAGES.ASSIGNMENT_NOT_FOUND);
    }
    if (assignment.isPublished) {
      throw new ConflictError(ADMIN_MESSAGES.ASSIGNMENT_ALREADY_PUBLISHED);
    }

    const updateData: UpdateAssignmentData = {
      title: data.title,
      leetcodeProblemId: data.leetcodeProblemId,
      leetcodeUrl: data.leetcodeUrl,
      difficulty: data.difficulty,
      topic: data.topic,
      description: data.description,
      date: data.date ? toUtcDayStart(new Date(data.date)) : undefined,
      updatedBy: adminUserId,
    };

    const updated = await this.repository.updateById(id, updateData);
    if (!updated) {
      throw new NotFoundError(ADMIN_MESSAGES.ASSIGNMENT_NOT_FOUND);
    }
    return updated;
  }

  async publishAssignment(id: string): Promise<IDailyAssignmentDocument> {
    // No extra "already published today" check needed: the { date: 1 } unique
    // index on DailyAssignment already makes two assignment documents sharing a
    // date impossible regardless of publish state.
    const published = await this.repository.publish(id);
    if (!published) {
      throw new NotFoundError(ADMIN_MESSAGES.ASSIGNMENT_NOT_FOUND);
    }

    this.sendDailyDsaEmails(published);

    return published;
  }
}
