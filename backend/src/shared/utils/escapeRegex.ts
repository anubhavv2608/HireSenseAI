/** Escapes RegExp special characters in user-supplied search input before it's
 * interpolated into a MongoDB $regex filter, preventing ReDoS and pattern injection. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
