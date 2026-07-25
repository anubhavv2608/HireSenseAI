import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UsernameAvailability,
  User,
} from "../types/auth.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const authApi = {
  login: (payload: LoginPayload) => unwrap<AuthResponse>(apiClient.post("/auth/login", payload)),

  register: (payload: RegisterPayload) => unwrap<AuthResponse>(apiClient.post("/auth/register", payload)),

  google: (payload: GoogleLoginPayload) => unwrap<AuthResponse>(apiClient.post("/auth/google", payload)),

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<User> => {
    const { user } = await unwrap<{ user: User }>(apiClient.get("/auth/me"));
    return user;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post("/auth/forgot-password", payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await apiClient.post("/auth/reset-password", payload);
  },

  checkUsernameAvailability: (username: string) =>
    unwrap<UsernameAvailability>(apiClient.get("/auth/username/available", { params: { username } })),

  updateUsername: async (username: string): Promise<User> => {
    const { user } = await unwrap<{ user: User }>(apiClient.patch("/auth/username", { username }));
    return user;
  },
};
