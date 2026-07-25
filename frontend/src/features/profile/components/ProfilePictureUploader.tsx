import { useRef, useState } from "react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toastSuccess, toastError } from "@/components/common/Toast";
import { isApiError } from "@/api/apiError";
import { useUploadProfilePicture } from "../hooks/useUploadProfilePicture";
import { useRemoveProfilePicture } from "../hooks/useRemoveProfilePicture";
import { validateProfilePictureFile } from "../utils/imageValidation";
import type { ProfilePicture } from "../types/profile.types";

interface ProfilePictureUploaderProps {
  name: string;
  email: string;
  profilePicture?: ProfilePicture;
}

export function ProfilePictureUploader({ name, email, profilePicture }: ProfilePictureUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProfilePicture();
  const removeMutation = useRemoveProfilePicture();

  function handleFileSelected(file: File) {
    const validation = validateProfilePictureFile(file);
    if (!validation.valid) {
      toastError("Invalid image", validation.reason);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    uploadMutation.mutate(file, {
      onSuccess: () => {
        toastSuccess("Profile picture updated");
        setPreviewUrl(null);
      },
      onError: (error) => {
        toastError("Couldn't upload picture", isApiError(error) ? error.message : undefined);
        setPreviewUrl(null);
      },
    });
  }

  function handleRemove() {
    removeMutation.mutate(undefined, {
      onSuccess: () => toastSuccess("Profile picture removed"),
      onError: (error) => toastError("Couldn't remove picture", isApiError(error) ? error.message : undefined),
    });
  }

  const isBusy = uploadMutation.isPending || removeMutation.isPending;

  return (
    <div className="flex items-center gap-4">
      <UserAvatar email={email} name={name} imageUrl={previewUrl ?? profilePicture?.url} size="lg" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            {profilePicture ? "Replace Photo" : "Upload Photo"}
          </Button>
          {profilePicture && (
            <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={handleRemove}>
              Remove
            </Button>
          )}
        </div>
        {uploadMutation.isPending && <Progress value={uploadMutation.progress} className="h-1.5 w-40" />}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload profile picture"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFileSelected(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
