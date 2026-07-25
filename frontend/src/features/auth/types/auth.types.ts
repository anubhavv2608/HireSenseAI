export type AuthProvider = "email" | "google";

export type Role = "student" | "admin" | "super_admin";

export interface User {
  _id: string;
  email: string;
  username: string;
  authProvider: AuthProvider;
  role: Role;
  isActive: boolean;
  dailyDsaEnabled: boolean;
  dailyDsaEnabledAt: string | null;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  totalCompleted: number;
  completionRate: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export type GoogleAuthMode = "login" | "signup";

export interface GoogleLoginPayload {
  idToken: string;
  mode: GoogleAuthMode;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface UsernameAvailability {
  available: boolean;
}
