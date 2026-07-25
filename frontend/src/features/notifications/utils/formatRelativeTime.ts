const UNITS: [number, string][] = [
  [60, "s"],
  [60, "m"],
  [24, "h"],
  [7, "d"],
  [4.345, "w"],
  [12, "mo"],
  [Number.POSITIVE_INFINITY, "y"],
];

export function formatRelativeTime(iso: string): string {
  const diffSeconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSeconds < 30) return "just now";

  let value = diffSeconds;
  for (const [divisor, unit] of UNITS) {
    if (value < divisor) {
      return `${Math.floor(value)}${unit} ago`;
    }
    value /= divisor;
  }
  return new Date(iso).toLocaleDateString();
}
