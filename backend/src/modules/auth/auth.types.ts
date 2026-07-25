import { Role } from '../../shared/types';

export type AuthProvider = 'email' | 'google';

export type GoogleAuthMode = 'login' | 'signup';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  passwordHash?: string;
  authProvider: AuthProvider;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  lastLoginAt?: Date | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDTO {
  email: string;
  password?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface GoogleUserDTO {
  idToken: string;
}
