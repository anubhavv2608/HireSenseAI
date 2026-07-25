import type { AxiosProgressEvent } from "axios";
import { apiClient } from "@/api/axiosClient";
import type { ApiEnvelope } from "@/types/api.types";
import type { ExtractedJobText } from "../types/jobInput.types";

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

// Extraction is a synchronous parse (no AI call), but still needs headroom
// beyond the default 15s for larger files or slower networks.
const EXTRACT_TIMEOUT_MS = 30_000;

export const jobInputApi = {
  extractFromPdf: (file: File, onUploadProgress?: (event: AxiosProgressEvent) => void): Promise<ExtractedJobText> =>
    unwrap<ExtractedJobText>(
      apiClient.post("/job-input/extract", toFormData(file), { timeout: EXTRACT_TIMEOUT_MS, onUploadProgress }),
    ),
};
