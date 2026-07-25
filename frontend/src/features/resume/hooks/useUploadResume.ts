import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { resumeApi } from "../api/resume.api";
import { resumeKeys } from "../api/queryKeys";
import { dashboardKeys } from "@/features/dashboard/api/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { useProcessResume } from "./useProcessResume";

type UploadMode = "upload" | "replace";

export function useResumeUploadMutation(mode: UploadMode) {
  const [progress, setProgress] = useState(0);
  const processResume = useProcessResume();

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      const onUploadProgress = (event: AxiosProgressEvent) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      return mode === "upload" ? resumeApi.upload(file, onUploadProgress) : resumeApi.replace(file, onUploadProgress);
    },
    onSuccess: (resume) => {
      setProgress(100);
      queryClient.invalidateQueries({ queryKey: resumeKeys.current() });
      queryClient.invalidateQueries({ queryKey: resumeKeys.history() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
      processResume.mutate(resume._id);
    },
    onError: () => {
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

export function useUploadResume() {
  return useResumeUploadMutation("upload");
}
