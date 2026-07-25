export const PROFILE_PICTURE_MAX_SIZE_BYTES = 2 * 1024 * 1024;
export const PROFILE_PICTURE_ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];

export type ProfilePictureFileValidation = { valid: true } | { valid: false; reason: string };

export function validateProfilePictureFile(file: File): ProfilePictureFileValidation {
  if (!PROFILE_PICTURE_ACCEPTED_MIME.includes(file.type)) {
    return { valid: false, reason: "Only JPEG, PNG, or WebP images are allowed." };
  }
  if (file.size > PROFILE_PICTURE_MAX_SIZE_BYTES) {
    return { valid: false, reason: "Image must be 2MB or smaller." };
  }
  return { valid: true };
}
