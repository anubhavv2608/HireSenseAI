import { Schema, model, Document } from 'mongoose';
import { AuthProvider } from './auth.types';
import { Role } from '../../shared/types';
import { ROLES } from '../../shared/constants/roles';

export interface IUserDocument extends Document {
  email: string;
  username: string;
  passwordHash?: string;
  authProvider: AuthProvider;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  lastLoginAt?: Date | null;
  role: Role;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  dailyDsaEnabled: boolean;
  dailyDsaEnabledAt?: Date | null;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: Date | null;
  totalCompleted: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // sparse kept even though required: true — a sparse unique index is a strict
    // superset of a plain unique index here (this schema/DB has already been
    // backfilled via `npm run migrate:usernames`, so no document lacks the
    // field) and keeps the index resilient if that invariant is ever violated
    // by a raw collection write that bypasses Mongoose validation.
    username: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
      required: true,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: 'student',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
    dailyDsaEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    dailyDsaEnabledAt: {
      type: Date,
      default: null,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Backs the leaderboard's overall-scope sort ({ currentStreak: -1, totalCompleted: -1 }),
// previously unindexed.
userSchema.index({ currentStreak: -1, totalCompleted: -1 });

export const UserModel = model<IUserDocument>('User', userSchema);
