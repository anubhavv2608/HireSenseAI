export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 25;

const CHARSET_REGEX = /^[a-z0-9_]+$/;

/** Mirrors backend/src/shared/utils/username.ts's isValidUsername — keep in sync. */
export function isValidUsernameFormat(value: string): boolean {
  if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) return false;
  if (!CHARSET_REGEX.test(value)) return false;
  if (value.startsWith("_") || value.endsWith("_")) return false;
  if (value.includes("__")) return false;
  return true;
}

export const USERNAME_FORMAT_HINT =
  "3-25 characters: lowercase letters, numbers, and underscores. No leading/trailing or double underscores.";
