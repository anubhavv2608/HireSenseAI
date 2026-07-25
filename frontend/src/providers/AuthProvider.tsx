import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext, type AuthContextValue, type AuthStatus } from "@/store/authContext";
import { authApi } from "@/features/auth/api/auth.api";
import { refreshAccessToken } from "@/api/axiosClient";
import { setAccessToken, registerSessionExpiredHandler } from "@/services/tokenStorage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import type { User } from "@/features/auth/types/auth.types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const setSession = useCallback((nextUser: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await refreshAccessToken();
        const currentUser = await authApi.getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <LoadingSpinner fullPage label="Loading your session..." />;
  }

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    isSuperAdmin: user?.role === "super_admin",
    setSession,
    clearSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
