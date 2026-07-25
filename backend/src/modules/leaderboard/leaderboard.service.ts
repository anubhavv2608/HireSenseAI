import { getPaginationOptions, createPaginatedResponse } from '../../shared/utils/pagination';
import { PaginatedResponse } from '../../shared/types';
import { NotFoundError } from '../../shared/errors/ApiError';
import { toUtcDayStart, toUtcWeekStart, toUtcMonthStart } from '../../shared/utils/date';
import { AuthRepository } from '../auth/auth.repository';
import { LeaderboardRepository } from './leaderboard.repository';
import { CurrentUserPosition, LeaderboardQuery, LeaderboardScope, RankedLeaderboardRow } from './leaderboard.types';

interface LeaderboardResult extends PaginatedResponse<RankedLeaderboardRow> {
  currentUserPosition: CurrentUserPosition;
}

function getWindowStart(scope: LeaderboardScope): Date {
  const now = new Date();
  if (scope === 'daily') return toUtcDayStart(now);
  if (scope === 'weekly') return toUtcWeekStart(now);
  return toUtcMonthStart(now);
}

export class LeaderboardService {
  private repository: LeaderboardRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.repository = new LeaderboardRepository();
    this.authRepository = new AuthRepository();
  }

  async getLeaderboard(userId: string, query: LeaderboardQuery): Promise<LeaderboardResult> {
    const { page, limit, skip } = getPaginationOptions(query);
    const scope = query.scope ?? 'overall';

    if (scope === 'overall') {
      return this.getOverallLeaderboard(userId, skip, limit, page, query.search);
    }
    return this.getWindowedLeaderboard(userId, scope, skip, limit, page, query.search);
  }

  private async getOverallLeaderboard(
    userId: string,
    skip: number,
    limit: number,
    page: number,
    search?: string
  ): Promise<LeaderboardResult> {
    const { items, total } = await this.repository.getTopUsers(skip, limit, search);
    const rankedItems: RankedLeaderboardRow[] = items.map((item, index) => ({ ...item, rank: skip + index + 1 }));
    const paginated = createPaginatedResponse(rankedItems, total, page, limit);

    const me = await this.authRepository.findById(userId);
    if (!me) {
      throw new NotFoundError('User not found');
    }

    const rank = await this.repository.getRankForUser(userId, me.currentStreak, me.totalCompleted);

    return {
      ...paginated,
      currentUserPosition: { rank, currentStreak: me.currentStreak, totalCompleted: me.totalCompleted },
    };
  }

  private async getWindowedLeaderboard(
    userId: string,
    scope: LeaderboardScope,
    skip: number,
    limit: number,
    page: number,
    search?: string
  ): Promise<LeaderboardResult> {
    const windowStart = getWindowStart(scope);
    const { items, total } = await this.repository.getTopUsersByWindow(windowStart, skip, limit, search);
    const rankedItems: RankedLeaderboardRow[] = items.map((item, index) => ({ ...item, rank: skip + index + 1 }));
    const paginated = createPaginatedResponse(rankedItems, total, page, limit);

    const me = await this.authRepository.findById(userId);
    if (!me) {
      throw new NotFoundError('User not found');
    }

    const myCount = await this.repository.getMyCountInWindow(userId, windowStart);
    const rank = await this.repository.getRankForUserByWindow(windowStart, myCount);

    return {
      ...paginated,
      currentUserPosition: { rank, currentStreak: me.currentStreak, totalCompleted: myCount },
    };
  }
}
