import { AuthRepository } from '../auth/auth.repository';
import { CompletionRepository } from '../daily-dsa/daily-dsa.completion.repository';
import { DailyAssignmentRepository } from '../daily-dsa/daily-dsa.assignment.repository';
import { LeaderboardRepository } from '../leaderboard/leaderboard.repository';
import { NotFoundError } from '../../shared/errors/ApiError';
import { toUtcDayStart } from '../../shared/utils/date';
import { StatisticsSummary } from './statistics.types';

function startOfIsoWeekUtc(date: Date): Date {
  const day = date.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diffToMonday);
  return toUtcDayStart(monday);
}

export class StatisticsService {
  private authRepository: AuthRepository;
  private completionRepository: CompletionRepository;
  private assignmentRepository: DailyAssignmentRepository;
  private leaderboardRepository: LeaderboardRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.completionRepository = new CompletionRepository();
    this.assignmentRepository = new DailyAssignmentRepository();
    this.leaderboardRepository = new LeaderboardRepository();
  }

  async getStatistics(userId: string): Promise<StatisticsSummary> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const weekStart = startOfIsoWeekUtc(now);

    const [monthlyCompletion, weeklyCompletion, totalChallenges, currentRank] = await Promise.all([
      this.completionRepository.countByUserIdSince(userId, monthStart),
      this.completionRepository.countByUserIdSince(userId, weekStart),
      this.assignmentRepository.countPublished({}),
      this.leaderboardRepository.getRankForUser(userId, user.currentStreak, user.totalCompleted),
    ]);

    return {
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalCompleted: user.totalCompleted,
      completionRate: user.completionRate,
      currentRank,
      monthlyCompletion,
      weeklyCompletion,
      totalChallenges,
    };
  }
}
