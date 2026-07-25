import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import type { Difficulty } from "../types/dailyDsa.types";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; tone: StatusTone }> = {
  EASY: { label: "Easy", tone: "success" },
  MEDIUM: { label: "Medium", tone: "warning" },
  HARD: { label: "Hard", tone: "danger" },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}
