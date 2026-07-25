import type { ReactNode } from "react";

/** Light-only this sprint. Kept as a dedicated provider so a future dark-mode toggle has a
 * single place to land without touching every consumer. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
