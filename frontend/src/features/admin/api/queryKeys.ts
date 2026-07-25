import type { AdminUsersQuery } from "../types/admin.types";

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  users: (query?: AdminUsersQuery) => [...adminKeys.all, "users", query ?? {}] as const,
  resumes: (query?: { page?: number; limit?: number; search?: string }) =>
    [...adminKeys.all, "resumes", query ?? {}] as const,
  assignments: (query?: { page?: number; limit?: number }) =>
    [...adminKeys.all, "assignments", query ?? {}] as const,
};
