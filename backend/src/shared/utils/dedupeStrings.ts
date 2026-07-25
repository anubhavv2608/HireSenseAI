/** Case/whitespace-insensitive de-duplication for AI-generated string lists
 * (recommendations, strengths, weaknesses, etc.) — models frequently repeat
 * near-identical phrasing across fields. Drops empty entries too. */
export function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }

  return result;
}
