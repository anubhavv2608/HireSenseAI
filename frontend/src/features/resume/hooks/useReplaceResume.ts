import { useResumeUploadMutation } from "./useUploadResume";

export function useReplaceResume() {
  return useResumeUploadMutation("replace");
}
