export const JOB_FILE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const JOB_FILE_ACCEPTED_MIME = "application/pdf";

export type JobFileValidation = { valid: true } | { valid: false; reason: string };

export function validateJobFile(file: File): JobFileValidation {
  if (file.type !== JOB_FILE_ACCEPTED_MIME) {
    return { valid: false, reason: "Only PDF files are allowed." };
  }
  if (file.size > JOB_FILE_MAX_SIZE_BYTES) {
    return { valid: false, reason: "File must be 5MB or smaller." };
  }
  return { valid: true };
}
