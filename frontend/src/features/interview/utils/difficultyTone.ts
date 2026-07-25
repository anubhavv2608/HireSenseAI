import type { StatusTone } from "@/components/common/StatusBadge";
import type { QuestionDifficulty } from "../types/interview.types";

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const DIFFICULTY_TONES: Record<QuestionDifficulty, StatusTone> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
};
