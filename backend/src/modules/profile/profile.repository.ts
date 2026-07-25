import { PipelineStage, Types } from 'mongoose';
import { ProfileModel, IProfileDocument } from './profile.schema';
import {
  ProfileEntityCreate,
  ProfileEntityUpdate,
  ProfilePictureDTO,
  SearchStudentsQuery,
  StudentCardDTO,
} from './profile.types';
import { escapeRegex } from '../../shared/utils/escapeRegex';

export interface SearchProfilesOptions extends SearchStudentsQuery {
  skip: number;
  limit: number;
}

export class ProfileRepository {
  async findByUserId(userId: string): Promise<IProfileDocument | null> {
    return ProfileModel.findOne({ userId, isDeleted: false });
  }

  async createProfile(userId: string, data: ProfileEntityCreate & { profileCompleted: boolean }): Promise<IProfileDocument> {
    return ProfileModel.create({
      userId,
      ...data,
    });
  }

  async updateByUserId(
    userId: string,
    updateData: ProfileEntityUpdate & { profileCompleted?: boolean }
  ): Promise<IProfileDocument | null> {
    return ProfileModel.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDeleteByUserId(userId: string): Promise<boolean> {
    const result = await ProfileModel.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    return !!result;
  }

  async updateProfilePicture(userId: string, picture: ProfilePictureDTO | null): Promise<IProfileDocument | null> {
    const update = picture ? { $set: { profilePicture: picture } } : { $unset: { profilePicture: '' } };
    return ProfileModel.findOneAndUpdate({ userId, isDeleted: false }, update, { new: true });
  }

  async findPublicByUserIds(
    userIds: string[]
  ): Promise<Pick<IProfileDocument, 'userId' | 'fullName' | 'college' | 'branch' | 'skills' | 'profilePicture'>[]> {
    return ProfileModel.find({ userId: { $in: userIds }, isDeleted: false }).select(
      'userId fullName college branch skills profilePicture'
    );
  }

  async searchProfiles({
    search,
    college,
    branch,
    graduationYear,
    skills,
    sort,
    skip,
    limit,
    excludeUserId,
  }: SearchProfilesOptions): Promise<{ items: StudentCardDTO[]; total: number }> {
    const basePipeline: PipelineStage[] = [
      {
        $match: {
          isDeleted: false,
          ...(excludeUserId && { userId: { $ne: new Types.ObjectId(excludeUserId) } }),
        },
      },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $match: {
          'user.role': 'student',
          'user.isActive': true,
          'user.isDeleted': { $ne: true },
        },
      },
    ];

    const filters: Record<string, unknown>[] = [];
    if (search) {
      const escapedSearch = escapeRegex(search);
      filters.push({
        $or: [{ fullName: { $regex: escapedSearch, $options: 'i' } }, { 'user.username': { $regex: escapedSearch, $options: 'i' } }],
      });
    }
    if (college) {
      filters.push({ college: { $regex: escapeRegex(college), $options: 'i' } });
    }
    if (branch) {
      filters.push({ branch: { $regex: escapeRegex(branch), $options: 'i' } });
    }
    if (graduationYear) {
      filters.push({ graduationYear });
    }
    if (skills && skills.length > 0) {
      filters.push({ skills: { $in: skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, 'i')) } });
    }

    if (filters.length > 0) {
      basePipeline.push({ $match: { $and: filters } });
    }

    const sortStage: PipelineStage =
      sort === 'oldest'
        ? { $sort: { createdAt: 1 } }
        : sort === 'name'
          ? { $sort: { fullName: 1 } }
          : { $sort: { createdAt: -1 } };

    // $facet runs the (potentially expensive) $lookup/$match stages above exactly
    // once and forks the result into both branches, instead of running them twice
    // (once for items, once purely for $count) as two separate aggregate() calls.
    const [result] = await ProfileModel.aggregate([
      ...basePipeline,
      {
        $facet: {
          items: [
            sortStage,
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: { $toString: '$userId' },
                username: { $ifNull: ['$user.username', null] },
                name: '$fullName',
                profilePicture: 1,
                college: 1,
                branch: 1,
                graduationYear: 1,
                skills: 1,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    return {
      items: (result?.items ?? []) as StudentCardDTO[],
      total: result?.totalCount?.[0]?.total ?? 0,
    };
  }
}
