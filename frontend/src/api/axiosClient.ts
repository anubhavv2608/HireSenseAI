import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { getAccessToken, setAccessToken, triggerSessionExpired } from "@/services/tokenStorage";
import { parseApiError } from "./apiError";
import type { ApiEnvelope } from "@/types/api.types";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
});

/** Un-intercepted instance used only for the refresh call, so it can never recurse into its own 401 handler. */
const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

/** Shared by the response interceptor and the app-boot session bootstrap so concurrent callers collapse into one network call. */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiEnvelope<{ accessToken: string }>>("/auth/refresh")
      .then(({ data }) => {
        const accessToken = data.data?.accessToken;
        if (!accessToken) {
          throw new Error("Refresh response did not include an access token.");
        }
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh") ?? false;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        triggerSessionExpired();
        return Promise.reject(parseApiError(refreshError));
      }
    }

    if (error.response?.status === 401 && isRefreshCall) {
      triggerSessionExpired();
    }

    return Promise.reject(parseApiError(error));
  },
);
