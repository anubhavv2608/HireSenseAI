import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { ProcessingDocument, ProcessingStatusSummary } from "../types/resume.types";

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const { data } = await promise;
  if (!data.data) {
    throw new Error(data.message || "Unexpected empty response.");
  }
  return data.data;
}

export const resumeProcessingApi = {
  process: async (resumeId: string): Promise<ProcessingDocument> => {
    const { processing } = await unwrap<{ processing: ProcessingDocument }>(
      apiClient.post("/resume-processing/process", { resumeId }),
    );
    return processing;
  },

  getStatus: async (resumeId: string): Promise<ProcessingStatusSummary> => {
    const { status } = await unwrap<{ status: ProcessingStatusSummary }>(
      apiClient.get(`/resume-processing/status/${resumeId}`),
    );
    return status;
  },

  getDetail: async (resumeId: string): Promise<ProcessingDocument> => {
    const { processing } = await unwrap<{ processing: ProcessingDocument }>(
      apiClient.get(`/resume-processing/${resumeId}`),
    );
    return processing;
  },
};
