import { Types } from 'mongoose';
import { AuthRepository } from '../auth/auth.repository';
import { ResumeRepository } from '../resume/resume.repository';
import { ResumeProcessingRepository } from '../resume-processing/resume-processing.repository';
import { PROCESSING_STATUS } from '../resume-processing/resume-processing.constants';
import { DailyAssignmentRepository } from '../daily-dsa/daily-dsa.assignment.repository';
import { CompletionRepository } from '../daily-dsa/daily-dsa.completion.repository';
import { toUtcDayStart } from '../../shared/utils/date';
import { ACTIVE_SINCE_DAYS, RECENT_ACTIVITY_LIMIT } from './admin.constants';
import { AdminDashboardSummary, RecentActivityItem } from './admin.types';

interface PopulatedCompletion {
  userId: { email: string } | null;
  assignmentId: { title: string } | null;
  completedAt: Date;
}

export class AdminDashboardService {
  private authRepository: AuthRepository;
  private resumeRepository: ResumeRepository;
  private resumeProcessingRepository: ResumeProcessingRepository;
  private assignmentRepository: DailyAssignmentRepository;
  private completionRepository: CompletionRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.resumeRepository = new ResumeRepository();
    this.resumeProcessingRepository = new ResumeProcessingRepository();
    this.assignmentRepository = new DailyAssignmentRepository();
    this.completionRepository = new CompletionRepository();
  }

  async getDashboard(): Promise<AdminDashboardSummary> {
    const today = toUtcDayStart(new Date());
    const activeSince = new Date(Date.now() - ACTIVE_SINCE_DAYS * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      resumesUploaded,
      resumesProcessed,
      dailyDsaParticipants,
      averageStreak,
      todaysAssignment,
      recentCompletions,
    ] = await Promise.all([
      this.authRepository.countAll(),
      this.authRepository.countActiveSince(activeSince),
      this.resumeRepository.countAll(),
      this.resumeProcessingRepository.countByStatus(PROCESSING_STATUS.COMPLETED),
      this.authRepository.countDailyDsaEnabled(),
      this.authRepository.getAverageStreak(),
      this.assignmentRepository.findTodayPublished(today),
      this.completionRepository.findRecent(RECENT_ACTIVITY_LIMIT),
    ]);

    let todaysCompletionRate = 0;
    if (todaysAssignment && dailyDsaParticipants > 0) {
      const todaysCompletions = await this.completionRepository.countByAssignmentId(
        (todaysAssignment._id as Types.ObjectId).toString()
      );
      todaysCompletionRate = Math.round((todaysCompletions / dailyDsaParticipants) * 100);
    }

    const recentActivity: RecentActivityItem[] = (recentCompletions as unknown as PopulatedCompletion[]).map(
      (completion) => ({
        userEmail: completion.userId?.email ?? 'Unknown',
        assignmentTitle: completion.assignmentId?.title ?? 'Unknown',
        completedAt: completion.completedAt,
      })
    );

    return {
      totalUsers,
      activeUsers,
      resumesUploaded,
      resumesProcessed,
      dailyDsaParticipants,
      todaysCompletionRate,
      averageStreak,
      recentActivity,
    };
  }
}
