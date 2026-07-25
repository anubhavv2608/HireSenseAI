import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 1200;

export function useRotatingMessage(messages: string[], active: boolean, intervalMs = DEFAULT_INTERVAL_MS): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);

  return messages[index];
}
