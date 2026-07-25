import { DailyAssignmentModel, IDailyAssignmentDocument } from './daily-dsa.assignment.schema';
import { Difficulty } from './daily-dsa.types';

export interface CreateAssignmentData {
  title: string;
  leetcodeProblemId: string;
  leetcodeUrl: string;
  difficulty: Difficulty;
  topic: string;
  description?: string;
  date: Date;
  createdBy: string;
}

export interface UpdateAssignmentData {
  title?: string;
  leetcodeProblemId?: string;
  leetcodeUrl?: string;
  difficulty?: Difficulty;
  topic?: string;
  description?: string;
  date?: Date;
  updatedBy?: string;
}

export interface CountPublishedFilter {
  dateFrom?: Date;
  dateTo?: Date;
}

export class DailyAssignmentRepository {
  async findByDate(date: Date): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOne({ date, isDeleted: false });
  }

  async findTodayPublished(todayUtcMidnight: Date): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOne({ date: todayUtcMidnight, isPublished: true, isDeleted: false });
  }

  async findPublishedPaginated({
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }): Promise<{ items: IDailyAssignmentDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      DailyAssignmentModel.find({ isPublished: true, isDeleted: false })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      DailyAssignmentModel.countDocuments({ isPublished: true, isDeleted: false }),
    ]);
    return { items, total };
  }

  async countPublished(filter: CountPublishedFilter = {}): Promise<number> {
    const query: Record<string, unknown> = { isPublished: true, isDeleted: false };
    if (filter.dateFrom || filter.dateTo) {
      const range: Record<string, Date> = {};
      if (filter.dateFrom) range.$gte = filter.dateFrom;
      if (filter.dateTo) range.$lte = filter.dateTo;
      query.date = range;
    }
    return DailyAssignmentModel.countDocuments(query);
  }

  async findById(id: string): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOne({ _id: id, isDeleted: false });
  }

  async create(data: CreateAssignmentData): Promise<IDailyAssignmentDocument> {
    return DailyAssignmentModel.create(data);
  }

  async findAllAdmin({
    skip,
    limit,
  }: {
    skip: number;
    limit: number;
  }): Promise<{ items: IDailyAssignmentDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      DailyAssignmentModel.find({ isDeleted: false }).sort({ date: -1 }).skip(skip).limit(limit),
      DailyAssignmentModel.countDocuments({ isDeleted: false }),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: UpdateAssignmentData): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true });
  }

  async publish(id: string): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isPublished: true, publishedAt: new Date() } },
      { new: true }
    );
  }

  async softDelete(id: string): Promise<IDailyAssignmentDocument | null> {
    return DailyAssignmentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }
}
