export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 25;

const CHARSET_REGEX = /^[a-z0-9_]+$/;

export function isValidUsername(value: string): boolean {
  if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) return false;
  if (!CHARSET_REGEX.test(value)) return false;
  if (value.startsWith('_') || value.endsWith('_')) return false;
  if (value.includes('__')) return false;
  return true;
}

/** Derives a valid username *base* (not guaranteed unique) from an arbitrary seed
 * string such as an email local-part or a full name. */
export function slugifyToUsernameBase(seed: string): string {
  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, USERNAME_MAX_LENGTH - 5) // leave room for a numeric collision suffix
    .replace(/^_+|_+$/g, ''); // slicing can re-expose a trailing underscore

  const padded = slug.length >= USERNAME_MIN_LENGTH ? slug : `${slug}user`.slice(0, USERNAME_MAX_LENGTH);
  return padded || 'user';
}

const MAX_GENERATION_ATTEMPTS = 25;

/** Appends a numeric suffix to `base` until `isTaken` reports the candidate is
 * free, bounded by MAX_GENERATION_ATTEMPTS before falling back to a random
 * suffix so this can never loop forever. */
export async function generateUniqueUsername(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  if (!(await isTaken(base))) return base;

  for (let attempt = 2; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const suffix = String(attempt);
    const candidate = `${base.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${base.slice(0, USERNAME_MAX_LENGTH - randomSuffix.length)}${randomSuffix}`;
}
