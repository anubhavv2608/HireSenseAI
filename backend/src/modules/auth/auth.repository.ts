import { PipelineStage } from 'mongoose';
import { UserModel, IUserDocument } from './auth.schema';
import { AuthProvider } from './auth.types';
import { Role } from '../../shared/types';
import { escapeRegex } from '../../shared/utils/escapeRegex';

export interface DailyDsaStatsUpdate {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: Date | null;
  totalCompleted: number;
  completionRate: number;
}

export interface AdminUserRow {
  userId: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  dailyDsaEnabled: boolean;
  currentStreak: number;
  fullName: string | null;
}

export interface FindAllAdminOptions {
  skip: number;
  limit: number;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export class AuthRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } });
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ username: username.toLowerCase(), isDeleted: { $ne: true } });
  }

  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { username: username.toLowerCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const existing = await UserModel.findOne(query).select('_id');
    return !!existing;
  }

  async updateUsername(userId: string, username: string): Promise<IUserDocument | null> {
    return UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: { $ne: true } },
      { $set: { username: username.toLowerCase() } },
      { new: true, runValidators: true }
    );
  }

  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } }).select('+passwordHash');
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ _id: id, isDeleted: { $ne: true } });
  }

  /** Batches a fixed/known set of user ids into a single query instead of N
   * separate findById calls (e.g. a friend request's requester+recipient, or a
   * challenge's challenger+opponent). */
  async findByIds(ids: string[]): Promise<IUserDocument[]> {
    return UserModel.find({ _id: { $in: ids }, isDeleted: { $ne: true } });
  }

  async findByIdWithRefreshToken(id: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ _id: id, isDeleted: { $ne: true } }).select('+refreshToken');
  }

  async findByResetPasswordToken(token: string): Promise<IUserDocument | null> {
    return UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      isDeleted: { $ne: true },
    }).select('+resetPasswordToken +resetPasswordExpires');
  }

  async createUser(data: {
    email: string;
    username: string;
    passwordHash?: string;
    authProvider?: AuthProvider;
    role?: Role;
  }): Promise<IUserDocument> {
    return UserModel.create({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash: data.passwordHash,
      authProvider: data.authProvider || 'email',
      role: data.role || 'student',
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }

  async updateResetPasswordToken(
    userId: string,
    resetToken: string | null,
    expires: Date | null
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async updateRole(userId: string, role: Role): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { role, isActive: true });
  }

  async setActive(userId: string, isActive: boolean): Promise<IUserDocument | null> {
    return UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: { $ne: true } },
      { $set: { isActive } },
      { new: true }
    );
  }

  async softDelete(userId: string): Promise<IUserDocument | null> {
    return UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
      { new: true }
    );
  }

  /** Users eligible for Daily DSA emails: opted into Daily DSA, and either have no
   * profile yet or haven't explicitly turned the email preference off (the
   * Profile schema defaults `receiveDailyDSAEmails` to true). */
  async findDailyDsaEmailRecipients(): Promise<{ email: string; fullName: string | null }[]> {
    const rows = await UserModel.aggregate([
      { $match: { dailyDsaEnabled: true, isActive: true, isDeleted: { $ne: true } } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      { $match: { 'profile.receiveDailyDSAEmails': { $ne: false } } },
      { $project: { _id: 0, email: 1, fullName: { $ifNull: ['$profile.fullName', null] } } },
    ]);

    return rows as { email: string; fullName: string | null }[];
  }

  async countAll(): Promise<number> {
    return UserModel.countDocuments({ isDeleted: { $ne: true } });
  }

  async countActiveSince(date: Date): Promise<number> {
    return UserModel.countDocuments({ isDeleted: { $ne: true }, lastLoginAt: { $gte: date } });
  }

  async countDailyDsaEnabled(): Promise<number> {
    return UserModel.countDocuments({ isDeleted: { $ne: true }, dailyDsaEnabled: true });
  }

  async getAverageStreak(): Promise<number> {
    const result = await UserModel.aggregate([
      { $match: { isDeleted: { $ne: true }, dailyDsaEnabled: true } },
      { $group: { _id: null, avg: { $avg: '$currentStreak' } } },
    ]);
    return result[0]?.avg ?? 0;
  }

  async enableDailyDsa(userId: string): Promise<IUserDocument | null> {
    const user = await UserModel.findOne({ _id: userId, isDeleted: { $ne: true } });
    if (!user) return null;

    if (!user.dailyDsaEnabledAt) {
      return UserModel.findByIdAndUpdate(
        userId,
        { $set: { dailyDsaEnabled: true, dailyDsaEnabledAt: new Date() } },
        { new: true }
      );
    }

    return UserModel.findByIdAndUpdate(userId, { $set: { dailyDsaEnabled: true } }, { new: true });
  }

  async updateDailyDsaStats(userId: string, stats: DailyDsaStatsUpdate): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $set: stats });
  }

  async findAllAdmin({ skip, limit, search, sort }: FindAllAdminOptions): Promise<{ items: AdminUserRow[]; total: number }> {
    const basePipeline: PipelineStage[] = [
      { $match: { isDeleted: { $ne: true } } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const escapedSearch = escapeRegex(search);
      basePipeline.push({
        $match: {
          $or: [
            { email: { $regex: escapedSearch, $options: 'i' } },
            { 'profile.fullName': { $regex: escapedSearch, $options: 'i' } },
          ],
        },
      });
    }

    const [result] = await UserModel.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [
            { $sort: { createdAt: sort === 'oldest' ? 1 : -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: '$_id' },
                email: 1,
                role: { $ifNull: ['$role', 'student'] },
                isActive: { $ifNull: ['$isActive', true] },
                createdAt: 1,
                dailyDsaEnabled: 1,
                currentStreak: 1,
                fullName: { $ifNull: ['$profile.fullName', null] },
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    return {
      items: (result?.items ?? []) as AdminUserRow[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }
}
