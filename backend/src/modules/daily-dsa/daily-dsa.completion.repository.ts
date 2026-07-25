import { AssignmentCompletionModel, IAssignmentCompletionDocument } from './daily-dsa.completion.schema';

export class CompletionRepository {
  async create(userId: string, assignmentId: string): Promise<IAssignmentCompletionDocument> {
    return AssignmentCompletionModel.create({ userId, assignmentId });
  }

  async findByUserIdAndAssignmentId(
    userId: string,
    assignmentId: string
  ): Promise<IAssignmentCompletionDocument | null> {
    return AssignmentCompletionModel.findOne({ userId, assignmentId });
  }

  async findByUserIdAndAssignmentIds(
    userId: string,
    assignmentIds: string[]
  ): Promise<IAssignmentCompletionDocument[]> {
    return AssignmentCompletionModel.find({ userId, assignmentId: { $in: assignmentIds } });
  }

  async countByUserIdSince(userId: string, sinceDate: Date): Promise<number> {
    return AssignmentCompletionModel.countDocuments({ userId, completedAt: { $gte: sinceDate } });
  }

  async countByAssignmentId(assignmentId: string): Promise<number> {
    return AssignmentCompletionModel.countDocuments({ assignmentId });
  }

  async findRecent(limit: number): Promise<IAssignmentCompletionDocument[]> {
    return AssignmentCompletionModel.find()
      .sort({ completedAt: -1 })
      .limit(limit)
      .populate('userId', 'email')
      .populate('assignmentId', 'title');
  }
}
