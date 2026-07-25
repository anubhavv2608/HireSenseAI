import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "../api/queryKeys";
import { queryClient } from "@/lib/queryClient";

export function useUploadProfilePicture() {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      setProgress(0);
      const onUploadProgress = (event: AxiosProgressEvent) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      return profileApi.uploadProfilePicture(file, onUploadProgress);
    },
    onSuccess: () => {
      setProgress(100);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: () => {
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}
