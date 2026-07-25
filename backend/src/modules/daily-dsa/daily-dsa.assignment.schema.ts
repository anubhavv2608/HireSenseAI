import { Schema, model, Document, Types } from 'mongoose';
import { DIFFICULTY_VALUES, Difficulty } from './daily-dsa.types';

export interface IDailyAssignmentDocument extends Document {
  title: string;
  leetcodeProblemId: string;
  leetcodeUrl: string;
  difficulty: Difficulty;
  topic: string;
  description?: string | null;
  date: Date;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const dailyAssignmentSchema = new Schema<IDailyAssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    leetcodeProblemId: { type: String, required: true, trim: true },
    leetcodeUrl: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: DIFFICULTY_VALUES, required: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    date: { type: Date, required: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false, select: false, index: true },
    deletedAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Single global track: exactly one assignment per calendar day, per spec. Multi-track
// support later is an additive migration (new `track` field + sentinel default, widen
// this to { date: 1, track: 1 }) — not pre-built now.
dailyAssignmentSchema.index({ date: 1 }, { unique: true });
dailyAssignmentSchema.index({ isPublished: 1, date: -1 });

export const DailyAssignmentModel = model<IDailyAssignmentDocument>('DailyAssignment', dailyAssignmentSchema);
