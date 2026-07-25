import { CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import { StatTile } from "@/components/common/StatTile";
import type { ProfileStats as ProfileStatsData } from "../types/profile.types";

export function ProfileStats({ stats }: { stats: ProfileStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        icon={Sparkles}
        value={stats.resumeScore !== null ? `${stats.resumeScore}` : "—"}
        label="Resume Score"
      />
      <StatTile icon={Flame} value={`${stats.currentStreak}d`} label="Current Streak" />
      <StatTile icon={Trophy} value={`${stats.bestStreak}d`} label="Best Streak" />
      <StatTile icon={CheckCircle2} value={stats.problemsSolved} label="Problems Solved" />
    </div>
  );
}
