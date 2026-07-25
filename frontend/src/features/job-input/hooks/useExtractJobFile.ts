import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { jobInputApi } from "../api/jobInput.api";

export function useExtractJobFile() {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      const onUploadProgress = (event: AxiosProgressEvent) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      return jobInputApi.extractFromPdf(file, onUploadProgress);
    },
    onSuccess: () => setProgress(100),
    onError: () => setProgress(0),
  });

  return { ...mutation, progress };
}
