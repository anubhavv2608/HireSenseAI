import { Schema, model, Document, Types } from 'mongoose';

export interface IAssignmentCompletionDocument extends Document {
  userId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  completed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentCompletionSchema = new Schema<IAssignmentCompletionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'DailyAssignment', required: true, index: true },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// First true compound-unique index in this codebase (every other compound index
// elsewhere is deliberately non-unique — see job-description-analysis.schema.ts /
// interview-generator.schema.ts). This one is deliberate: it enforces "one
// completion record per assignment per user" at the DB layer.
assignmentCompletionSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

export const AssignmentCompletionModel = model<IAssignmentCompletionDocument>(
  'AssignmentCompletion',
  assignmentCompletionSchema
);
