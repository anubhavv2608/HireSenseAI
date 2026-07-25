import { ResumeModel, IResumeDocument } from './resume.schema';
import { CreateResumeDTO } from './resume.types';
import { escapeRegex } from '../../shared/utils/escapeRegex';

export class ResumeRepository {
  async createResume(data: CreateResumeDTO): Promise<IResumeDocument> {
    return ResumeModel.create(data);
  }

  async findActiveByUserId(userId: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOne({ userId, isActive: true, isDeleted: false });
  }

  async findById(id: string, userId: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOne({ _id: id, userId, isDeleted: false });
  }

  async findAllByUserId(userId: string): Promise<IResumeDocument[]> {
    return ResumeModel.find({ userId, isDeleted: false }).sort({ uploadedAt: -1 });
  }

  async findLatestVersionByUserId(userId: string): Promise<number> {
    const latest = await ResumeModel.findOne({ userId }).sort({ version: -1 });
    return latest ? latest.version : 0;
  }

  async deactivateAllByUserId(userId: string): Promise<void> {
    await ResumeModel.updateMany({ userId, isActive: true }, { $set: { isActive: false } });
  }

  async setActiveResume(id: string, userId: string): Promise<IResumeDocument | null> {
    await this.deactivateAllByUserId(userId);
    return ResumeModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { $set: { isActive: true } },
      { new: true }
    );
  }

  async softDelete(id: string, userId: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
      { new: true }
    );
  }

  async findLatestNonDeleted(userId: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOne({ userId, isDeleted: false }).sort({ uploadedAt: -1 });
  }

  async countAll(): Promise<number> {
    return ResumeModel.countDocuments({ isDeleted: false });
  }

  async findByIdAdmin(id: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOne({ _id: id, isDeleted: false });
  }

  async findAllAdmin({
    skip,
    limit,
    search,
  }: {
    skip: number;
    limit: number;
    search?: string;
  }): Promise<{ items: IResumeDocument[]; total: number }> {
    const query: Record<string, unknown> = { isDeleted: false };
    if (search) {
      query.originalFilename = { $regex: escapeRegex(search), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      ResumeModel.find(query).sort({ uploadedAt: -1 }).skip(skip).limit(limit),
      ResumeModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async findActiveStatusByUserIds(userIds: string[]): Promise<Pick<IResumeDocument, 'userId' | 'status'>[]> {
    return ResumeModel.find({ userId: { $in: userIds }, isActive: true, isDeleted: false }).select('userId status');
  }

  async softDeleteAdmin(id: string): Promise<IResumeDocument | null> {
    return ResumeModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
      { new: true }
    );
  }
}
