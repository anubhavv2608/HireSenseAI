export const RESUME_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPTED_MIME = "application/pdf";

export type ResumeFileValidation = { valid: true } | { valid: false; reason: string };

export function validateResumeFile(file: File): ResumeFileValidation {
  if (file.type !== RESUME_ACCEPTED_MIME) {
    return { valid: false, reason: "Only PDF files are allowed." };
  }
  if (file.size > RESUME_MAX_SIZE_BYTES) {
    return { valid: false, reason: "File must be 5MB or smaller." };
  }
  return { valid: true };
}
