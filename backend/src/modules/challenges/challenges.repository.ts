import { Types } from 'mongoose';
import { ChallengeModel, IChallengeDocument } from './challenge.schema';
import { UserModel } from '../auth/auth.schema';
import { ChallengeListType, ChallengeProblemInput, ChallengeStatus } from './challenges.types';

export interface ChallengeParticipantInfo {
  username: string | null;
  name: string;
}

export class ChallengesRepository {
  async create(challengerId: string, opponentId: string, problem: ChallengeProblemInput): Promise<IChallengeDocument> {
    return ChallengeModel.create({ challengerId, opponentId, problem, status: 'pending' });
  }

  async findById(id: string): Promise<IChallengeDocument | null> {
    return ChallengeModel.findById(id);
  }

  async updateStatus(id: string, status: ChallengeStatus): Promise<IChallengeDocument | null> {
    return ChallengeModel.findByIdAndUpdate(id, { $set: { status, respondedAt: new Date() } }, { new: true });
  }

  async markCompletedBy(
    id: string,
    field: 'challengerCompletedAt' | 'opponentCompletedAt',
    when: Date
  ): Promise<IChallengeDocument | null> {
    return ChallengeModel.findByIdAndUpdate(id, { $set: { [field]: when } }, { new: true });
  }

  async finalize(id: string, winnerId: string | null): Promise<IChallengeDocument | null> {
    return ChallengeModel.findByIdAndUpdate(id, { $set: { status: 'completed', winnerId } }, { new: true });
  }

  async findPaginated(
    userId: string,
    type: ChallengeListType,
    { skip, limit }: { skip: number; limit: number }
  ): Promise<{ items: IChallengeDocument[]; total: number }> {
    const filter: Record<string, unknown> =
      type === 'incoming'
        ? { opponentId: userId, status: 'pending' }
        : type === 'outgoing'
          ? { challengerId: userId, status: 'pending' }
          : type === 'active'
            ? { status: 'accepted', $or: [{ challengerId: userId }, { opponentId: userId }] }
            : { status: 'completed', $or: [{ challengerId: userId }, { opponentId: userId }] };

    const [items, total] = await Promise.all([
      ChallengeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ChallengeModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async getParticipantsMap(userIds: string[]): Promise<Map<string, ChallengeParticipantInfo>> {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return new Map();

    const rows = await UserModel.aggregate([
      { $match: { _id: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) } } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          username: { $ifNull: ['$username', null] },
          name: { $ifNull: ['$profile.fullName', '$username'] },
        },
      },
    ]);

    const map = new Map<string, ChallengeParticipantInfo>();
    for (const row of rows as { userId: string; username: string | null; name: string }[]) {
      map.set(row.userId, { username: row.username, name: row.name });
    }
    return map;
  }
}
