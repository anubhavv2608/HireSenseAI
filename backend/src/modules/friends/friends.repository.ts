import { PipelineStage, Types } from 'mongoose';
import { FriendRequestModel, IFriendRequestDocument } from './friend-request.schema';
import { UserModel } from '../auth/auth.schema';
import { FriendCardDTO, FriendRequestDTO, FriendRequestListType, FriendRequestStatus } from './friends.types';
import { escapeRegex } from '../../shared/utils/escapeRegex';

export interface PaginatedFetchOptions {
  skip: number;
  limit: number;
  search?: string;
}

export class FriendsRepository {
  async findBetween(userIdA: string, userIdB: string): Promise<IFriendRequestDocument | null> {
    return FriendRequestModel.findOne({
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { requesterId: userIdA, recipientId: userIdB },
        { requesterId: userIdB, recipientId: userIdA },
      ],
    });
  }

  async create(requesterId: string, recipientId: string): Promise<IFriendRequestDocument> {
    return FriendRequestModel.create({ requesterId, recipientId, status: 'pending' });
  }

  async findById(id: string): Promise<IFriendRequestDocument | null> {
    return FriendRequestModel.findById(id);
  }

  async updateStatus(id: string, status: FriendRequestStatus): Promise<IFriendRequestDocument | null> {
    return FriendRequestModel.findByIdAndUpdate(id, { $set: { status, respondedAt: new Date() } }, { new: true });
  }

  async deleteAcceptedBetween(userIdA: string, userIdB: string): Promise<boolean> {
    const result = await FriendRequestModel.deleteOne({
      status: 'accepted',
      $or: [
        { requesterId: userIdA, recipientId: userIdB },
        { requesterId: userIdB, recipientId: userIdA },
      ],
    });
    return result.deletedCount > 0;
  }

  async getFriendIds(userId: string): Promise<string[]> {
    const rows = await FriendRequestModel.find({
      status: 'accepted',
      $or: [{ requesterId: userId }, { recipientId: userId }],
    }).select('requesterId recipientId');

    return rows.map((row) =>
      row.requesterId.toString() === userId ? row.recipientId.toString() : row.requesterId.toString()
    );
  }

  async findFriendsPaginated(
    userId: string,
    { skip, limit, search }: PaginatedFetchOptions
  ): Promise<{ items: FriendCardDTO[]; total: number }> {
    const friendIds = await this.getFriendIds(userId);
    if (friendIds.length === 0) {
      return { items: [], total: 0 };
    }

    const basePipeline: PipelineStage[] = [
      { $match: { _id: { $in: friendIds.map((id) => new Types.ObjectId(id)) } } },
      { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      const escapedSearch = escapeRegex(search);
      basePipeline.push({
        $match: {
          $or: [
            { username: { $regex: escapedSearch, $options: 'i' } },
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
            { $sort: { 'profile.fullName': 1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: '$_id' },
                username: { $ifNull: ['$username', null] },
                name: { $ifNull: ['$profile.fullName', '$username'] },
                profilePicture: '$profile.profilePicture',
                college: '$profile.college',
                branch: '$profile.branch',
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    return {
      items: (result?.items ?? []) as FriendCardDTO[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }

  async findRequestsPaginated(
    userId: string,
    type: FriendRequestListType,
    { skip, limit }: { skip: number; limit: number }
  ): Promise<{ items: FriendRequestDTO[]; total: number }> {
    const matchField = type === 'incoming' ? 'recipientId' : 'requesterId';
    const otherField = type === 'incoming' ? 'requesterId' : 'recipientId';

    const basePipeline: PipelineStage[] = [
      { $match: { [matchField]: new Types.ObjectId(userId), status: 'pending' } },
      { $lookup: { from: 'users', localField: otherField, foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $lookup: { from: 'profiles', localField: otherField, foreignField: 'userId', as: 'profile' } },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    ];

    const [result] = await FriendRequestModel.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                userId: { $toString: `$${otherField}` },
                username: { $ifNull: ['$user.username', null] },
                name: { $ifNull: ['$profile.fullName', '$user.username'] },
                profilePicture: '$profile.profilePicture',
                createdAt: 1,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    return {
      items: (result?.items ?? []) as FriendRequestDTO[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }
}
