import type { AxiosProgressEvent } from "axios";
import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { Resume } from "../types/resume.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

function toFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

export const resumeApi = {
  upload: async (file: File, onUploadProgress?: (event: AxiosProgressEvent) => void): Promise<Resume> => {
    const { resume } = await unwrap<{ resume: Resume }>(
      apiClient.post("/resume/upload", toFormData(file), { onUploadProgress }),
    );
    return resume;
  },

  replace: async (file: File, onUploadProgress?: (event: AxiosProgressEvent) => void): Promise<Resume> => {
    const { resume } = await unwrap<{ resume: Resume }>(
      apiClient.post("/resume/replace", toFormData(file), { onUploadProgress }),
    );
    return resume;
  },

  getCurrent: async (): Promise<Resume> => {
    const { resume } = await unwrap<{ resume: Resume }>(apiClient.get("/resume/current"));
    return resume;
  },

  getHistory: async (): Promise<Resume[]> => {
    const { resumes } = await unwrap<{ resumes: Resume[] }>(apiClient.get("/resume/history"));
    return resumes;
  },

  setActive: async (id: string): Promise<Resume> => {
    const { resume } = await unwrap<{ resume: Resume }>(apiClient.patch(`/resume/${id}/active`));
    return resume;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/resume/${id}`);
  },
};
