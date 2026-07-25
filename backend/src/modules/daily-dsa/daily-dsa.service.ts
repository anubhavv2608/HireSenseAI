import { Types } from 'mongoose';
import { DailyAssignmentRepository } from './daily-dsa.assignment.repository';
import { CompletionRepository } from './daily-dsa.completion.repository';
import { AuthRepository } from '../auth/auth.repository';
import { BadRequestError, NotFoundError } from '../../shared/errors/ApiError';
import { logger } from '../../shared/config/logger';
import { toUtcDayStart } from '../../shared/utils/date';
import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse, PaginationQuery } from '../../shared/types';
import { DAILY_DSA_MESSAGES } from './daily-dsa.constants';
import { DailyDsaStats } from './daily-dsa.types';
import { IDailyAssignmentDocument } from './daily-dsa.assignment.schema';
import { IAssignmentCompletionDocument } from './daily-dsa.completion.schema';
import { IUserDocument } from '../auth/auth.schema';

interface HistoryItem {
  assignment: IDailyAssignmentDocument;
  completed: boolean;
}

interface CompleteAssignmentResult {
  completion: IAssignmentCompletionDocument;
  stats: DailyDsaStats;
  alreadyCompleted: boolean;
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}

function statsFromUser(user: IUserDocument): DailyDsaStats {
  return {
    currentStreak: user.currentStreak,
    bestStreak: user.bestStreak,
    totalCompleted: user.totalCompleted,
    completionRate: user.completionRate,
    lastCompletedDate: user.lastCompletedDate ?? null,
  };
}

export class DailyDsaService {
  private assignmentRepository: DailyAssignmentRepository;
  private completionRepository: CompletionRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.assignmentRepository = new DailyAssignmentRepository();
    this.completionRepository = new CompletionRepository();
    this.authRepository = new AuthRepository();
  }

  async getToday(userId: string): Promise<{ assignment: IDailyAssignmentDocument; completed: boolean }> {
    const today = toUtcDayStart(new Date());
    const assignment = await this.assignmentRepository.findTodayPublished(today);
    if (!assignment) {
      throw new NotFoundError(DAILY_DSA_MESSAGES.ASSIGNMENT_NOT_FOUND);
    }

    const completion = await this.completionRepository.findByUserIdAndAssignmentId(
      userId,
      (assignment._id as Types.ObjectId).toString()
    );

    return { assignment, completed: !!completion };
  }

  async getHistory(userId: string, query: PaginationQuery): Promise<PaginatedResponse<HistoryItem>> {
    const { page, limit, skip } = getPaginationOptions(query);
    const { items, total } = await this.assignmentRepository.findPublishedPaginated({ skip, limit });

    const assignmentIds = items.map((item) => (item._id as Types.ObjectId).toString());
    const completions = await this.completionRepository.findByUserIdAndAssignmentIds(userId, assignmentIds);
    const completedSet = new Set(completions.map((completion) => completion.assignmentId.toString()));

    const data: HistoryItem[] = items.map((item) => ({
      assignment: item,
      completed: completedSet.has((item._id as Types.ObjectId).toString()),
    }));

    return createPaginatedResponse(data, total, page, limit);
  }

  async enableDailyDsa(userId: string): Promise<IUserDocument> {
    const user = await this.authRepository.enableDailyDsa(userId);
    if (!user) {
      throw new NotFoundError(DAILY_DSA_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async completeAssignment(
    userId: string,
    assignmentId: string,
    correlationId?: string
  ): Promise<CompleteAssignmentResult> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment || !assignment.isPublished) {
      throw new BadRequestError(DAILY_DSA_MESSAGES.ASSIGNMENT_NOT_PUBLISHED);
    }

    let completion: IAssignmentCompletionDocument;
    let alreadyCompleted = false;

    try {
      completion = await this.completionRepository.create(userId, assignmentId);
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }
      const existing = await this.completionRepository.findByUserIdAndAssignmentId(userId, assignmentId);
      if (!existing) {
        throw error;
      }
      completion = existing;
      alreadyCompleted = true;
    }

    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(DAILY_DSA_MESSAGES.USER_NOT_FOUND);
    }

    if (alreadyCompleted) {
      // Multiple completions of the same assignment are ignored per spec: return
      // the existing completion and current cached stats unchanged, not an error.
      return { completion, stats: statsFromUser(user), alreadyCompleted: true };
    }

    const today = toUtcDayStart(new Date());
    const isToday = toUtcDayStart(assignment.date).getTime() === today.getTime();

    let { currentStreak, bestStreak } = user;
    let lastCompletedDate = user.lastCompletedDate ?? null;

    if (isToday) {
      if (!lastCompletedDate) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round(
          (today.getTime() - toUtcDayStart(lastCompletedDate).getTime()) / 86_400_000
        );
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
        // diffDays === 0 is defensively a no-op; cannot occur since the unique
        // index on (userId, assignmentId) guards one completable "today" per user.
      }
      bestStreak = Math.max(bestStreak, currentStreak);
      lastCompletedDate = today;
    }
    // Backlog completion (isToday === false): currentStreak/lastCompletedDate left
    // untouched, per the spec's ambiguous streak rule interpreted here — completing
    // an old assignment always counts toward totalCompleted/completionRate but never
    // advances the streak, to avoid streak-gaming via batch-completing old challenges.

    const totalCompleted = user.totalCompleted + 1;
    const publishedSinceEnabled = await this.assignmentRepository.countPublished({
      dateFrom: user.dailyDsaEnabledAt ?? undefined,
      dateTo: today,
    });
    const completionRate =
      publishedSinceEnabled > 0 ? Math.round((totalCompleted / publishedSinceEnabled) * 100) : 0;

    await this.authRepository.updateDailyDsaStats(userId, {
      currentStreak,
      bestStreak,
      lastCompletedDate,
      totalCompleted,
      completionRate,
    });

    logger.info(
      `[DailyDsa] Assignment completed [UserID: ${userId}] [AssignmentID: ${assignmentId}] [CorrelationID: ${correlationId}]`
    );

    return {
      completion,
      stats: { currentStreak, bestStreak, totalCompleted, completionRate, lastCompletedDate },
      alreadyCompleted: false,
    };
  }
}
