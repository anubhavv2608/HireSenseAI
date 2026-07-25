export type CollegeType = "Government" | "Private" | "NIT" | "IIT" | "IIIT" | "Other";

export interface ProfilePicture {
  publicId: string;
  url: string;
}

export interface Profile {
  _id: string;
  userId: string;
  fullName: string;
  college?: string;
  collegeType?: CollegeType;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  bio?: string;
  skills: string[];
  profilePicture?: ProfilePicture;
  receiveDailyDSAEmails: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  resumeScore: number | null;
  currentStreak: number;
  bestStreak: number;
  problemsSolved: number;
}

export interface MyProfileResponse {
  profile: Profile;
  stats: ProfileStats;
  completionPercentage: number;
}

export interface PublicProfile {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: ProfilePicture;
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

export interface StudentCard {
  userId: string;
  username: string | null;
  name: string;
  profilePicture?: ProfilePicture;
  college?: string;
  branch?: string;
  graduationYear?: number;
  skills: string[];
}

export interface ProfileFormValues {
  fullName: string;
  college: string;
  collegeType?: CollegeType;
  degree: string;
  branch: string;
  graduationYear: string;
  github: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  about: string;
  skills: string[];
}

export interface SaveProfilePayload {
  fullName: string;
  college?: string;
  collegeType?: CollegeType;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  about?: string;
  skills?: string[];
}

export interface SearchStudentsQuery {
  search?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  skills?: string[];
  sort?: "newest" | "oldest" | "name";
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
