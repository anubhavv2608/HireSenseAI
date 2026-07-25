import { Schema, model, Document, Types } from 'mongoose';
import { COLLEGE_TYPES } from './profile.constants';

export interface IProfilePicture {
  publicId: string;
  url: string;
}

export interface IProfileDocument extends Document {
  userId: Types.ObjectId;
  fullName: string;
  college?: string;
  collegeType?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolioUrl?: string;
  leetcode?: string;
  codeforces?: string;
  targetRole?: string;
  targetCompany?: string;
  bio?: string;
  skills: string[];
  profilePicture?: IProfilePicture;
  receiveDailyDSAEmails: boolean;
  profileCompleted: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    college: {
      type: String,
      trim: true,
      index: true,
    },
    collegeType: {
      type: String,
      enum: COLLEGE_TYPES,
    },
    degree: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
      index: true,
    },
    graduationYear: {
      type: Number,
      index: true,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    leetcode: {
      type: String,
      trim: true,
    },
    codeforces: {
      type: String,
      trim: true,
    },
    targetRole: {
      type: String,
      trim: true,
    },
    targetCompany: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    profilePicture: {
      type: new Schema<IProfilePicture>(
        {
          publicId: { type: String, required: true },
          url: { type: String, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
    receiveDailyDSAEmails: {
      type: Boolean,
      default: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
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

// Backs Student Search's default filter+sort combo (isDeleted: false, newest first).
profileSchema.index({ isDeleted: 1, createdAt: -1 });

export const ProfileModel = model<IProfileDocument>('Profile', profileSchema);
