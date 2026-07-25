import { Types } from 'mongoose';
import { PaginationQuery } from '../../shared/types';

export interface IProfile {
  _id: string;
  userId: Types.ObjectId | string;
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
  profilePicture?: { publicId: string; url: string };
  receiveDailyDSAEmails: boolean;
  profileCompleted: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProfileDTO {
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
  about?: string;
  skills?: string[];
  receiveDailyDSAEmails?: boolean;
}

export type UpdateProfileDTO = Partial<CreateProfileDTO>;

/**
 * Shape actually persisted to the Profile document — `about` (the DTO/API
 * name) maps to the schema's `bio` field here; the service performs that
 * translation before calling the repository.
 */
export type ProfileEntityUpdate = Omit<UpdateProfileDTO, 'about'> & { bio?: string };
export type ProfileEntityCreate = Omit<CreateProfileDTO, 'about'> & { bio?: string; fullName: string };

export interface ProfileStats {
  resumeScore: number | null;
  currentStreak: number;
  bestStreak: number;
  problemsSolved: number;
}

export interface ProfilePictureDTO {
  publicId: string;
  url: string;
}

export interface SearchStudentsQuery extends PaginationQuery {
  search?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  skills?: string[];
  sort?: 'newest' | 'oldest' | 'name';
  excludeUserId?: string;
}

export interface StudentCardDTO {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: ProfilePictureDTO;
  college?: string;
  branch?: string;
  graduationYear?: number;
  skills: string[];
}

export interface PublicProfileDTO {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: ProfilePictureDTO;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  about?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  resumeScore: number | null;
  currentStreak: number;
  bestStreak: number;
  problemsSolved: number;
  completionPercentage: number;
}
