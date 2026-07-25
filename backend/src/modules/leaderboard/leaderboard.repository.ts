import { PipelineStage } from 'mongoose';
import { UserModel } from '../auth/auth.schema';
import { AssignmentCompletionModel } from '../daily-dsa/daily-dsa.completion.schema';
import { LeaderboardRow } from './leaderboard.types';
import { escapeRegex } from '../../shared/utils/escapeRegex';

function searchMatchStage(search?: string): PipelineStage[] {
  if (!search) return [];
  const escapedSearch = escapeRegex(search);
  return [
    {
      $match: {
        $or: [
          { username: { $regex: escapedSearch, $options: 'i' } },
          { 'profile.fullName': { $regex: escapedSearch, $options: 'i' } },
        ],
      },
    },
  ];
}

export class LeaderboardRepository {
  async getTopUsers(skip: number, limit: number, search?: string): Promise<{ items: LeaderboardRow[]; total: number }> {
    const basePipeline: PipelineStage[] = [
      { $match: { dailyDsaEnabled: true, isDeleted: { $ne: true } } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      ...searchMatchStage(search),
    ];

    const [result] = await UserModel.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [
            { $sort: { currentStreak: -1, totalCompleted: -1, _id: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: '$_id' },
                username: { $ifNull: ['$username', null] },
                fullName: { $ifNull: ['$profile.fullName', null] },
                currentStreak: 1,
                totalCompleted: 1,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ] satisfies PipelineStage[]);

    return {
      items: (result?.items ?? []) as LeaderboardRow[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }

  async getRankForUser(userId: string, currentStreak: number, totalCompleted: number): Promise<number> {
    const matchStage = {
      dailyDsaEnabled: true,
      isDeleted: { $ne: true },
      $or: [{ currentStreak: { $gt: currentStreak } }, { currentStreak, totalCompleted: { $gt: totalCompleted } }],
    };

    const aheadCount = await UserModel.countDocuments(matchStage);
    return aheadCount + 1;
  }

  /** Daily/weekly/monthly leaderboards rank by completions within the window,
   * aggregated straight off AssignmentCompletionModel — no cron/precomputation
   * needed since it's always computed fresh from the completion log. */
  async getTopUsersByWindow(
    windowStart: Date,
    skip: number,
    limit: number,
    search?: string
  ): Promise<{ items: LeaderboardRow[]; total: number }> {
    const basePipeline: PipelineStage[] = [
      { $match: { completedAt: { $gte: windowStart } } },
      { $group: { _id: '$userId', totalCompleted: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.isDeleted': { $ne: true }, 'user.isActive': true } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    ];

    // Unlike searchMatchStage() (used by getTopUsers, where username is a
    // top-level field), here it lives under the joined `user` document.
    if (search) {
      const escapedSearch = escapeRegex(search);
      basePipeline.push({
        $match: {
          $or: [
            { 'user.username': { $regex: escapedSearch, $options: 'i' } },
            { 'profile.fullName': { $regex: escapedSearch, $options: 'i' } },
          ],
        },
      });
    }

    const [result] = await AssignmentCompletionModel.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [
            { $sort: { totalCompleted: -1, _id: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: '$_id' },
                username: { $ifNull: ['$user.username', null] },
                fullName: { $ifNull: ['$profile.fullName', null] },
                currentStreak: '$user.currentStreak',
                totalCompleted: 1,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ] satisfies PipelineStage[]);

    return {
      items: (result?.items ?? []) as LeaderboardRow[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }

  async getMyCountInWindow(userId: string, windowStart: Date): Promise<number> {
    return AssignmentCompletionModel.countDocuments({ userId, completedAt: { $gte: windowStart } });
  }

  async getRankForUserByWindow(windowStart: Date, myCount: number): Promise<number> {
    const result = await AssignmentCompletionModel.aggregate([
      { $match: { completedAt: { $gte: windowStart } } },
      { $group: { _id: '$userId', totalCompleted: { $sum: 1 } } },
      { $match: { totalCompleted: { $gt: myCount } } },
      { $count: 'ahead' },
    ]);
    return (result[0]?.ahead ?? 0) + 1;
  }
}
