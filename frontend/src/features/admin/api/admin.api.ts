import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { Role } from "@/features/auth/types/auth.types";
import type {
  AdminAssignmentRow,
  AdminDashboardSummary,
  AdminResumeRow,
  AdminUserRow,
  AdminUsersQuery,
  CreateAssignmentPayload,
  PaginatedResult,
} from "../types/admin.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const adminApi = {
  getDashboard: (): Promise<AdminDashboardSummary> => unwrap(apiClient.get("/admin/dashboard")),

  listUsers: (query: AdminUsersQuery): Promise<PaginatedResult<AdminUserRow>> =>
    unwrap(apiClient.get("/admin/users", { params: query })),

  setUserActive: async (id: string, isActive: boolean): Promise<AdminUserRow> => {
    const { user } = await unwrap<{ user: AdminUserRow }>(apiClient.patch(`/admin/users/${id}`, { isActive }));
    return user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  changeUserRole: async (id: string, role: Role): Promise<AdminUserRow> => {
    const { user } = await unwrap<{ user: AdminUserRow }>(
      apiClient.patch(`/admin/users/${id}/change-role`, { role }),
    );
    return user;
  },

  listResumes: (query: { page?: number; limit?: number; search?: string }): Promise<PaginatedResult<AdminResumeRow>> =>
    unwrap(apiClient.get("/admin/resumes", { params: query })),

  deleteResume: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/resumes/${id}`);
  },

  reprocessResume: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/resumes/${id}/reprocess`);
  },

  listAssignments: (query: { page?: number; limit?: number }): Promise<PaginatedResult<AdminAssignmentRow>> =>
    unwrap(apiClient.get("/admin/assignments", { params: query })),

  createAssignment: async (payload: CreateAssignmentPayload): Promise<AdminAssignmentRow> => {
    const { assignment } = await unwrap<{ assignment: AdminAssignmentRow }>(
      apiClient.post("/admin/assignments", payload),
    );
    return assignment;
  },

  publishAssignment: async (id: string): Promise<AdminAssignmentRow> => {
    const { assignment } = await unwrap<{ assignment: AdminAssignmentRow }>(
      apiClient.post(`/admin/assignments/${id}/publish`),
    );
    return assignment;
  },
};
