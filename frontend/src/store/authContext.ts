import { createContext, useContext } from "react";
import type { User } from "@/features/auth/types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
