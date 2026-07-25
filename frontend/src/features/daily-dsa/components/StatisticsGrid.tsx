import { CheckCircle2, ClipboardList, Flame, Percent, Trophy } from "lucide-react";
import { StatTile } from "@/components/common/StatTile";
import type { DailyDsaStatisticsSummary } from "../types/dailyDsa.types";

interface StatisticsGridProps {
  statistics: DailyDsaStatisticsSummary;
}

export function StatisticsGrid({ statistics }: StatisticsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatTile icon={Flame} value={`${statistics.currentStreak}d`} label="Current Streak" />
      <StatTile icon={Trophy} value={`${statistics.bestStreak}d`} label="Best Streak" />
      <StatTile icon={CheckCircle2} value={statistics.totalCompleted} label="Total Completed" />
      <StatTile icon={Percent} value={`${statistics.completionRate}%`} label="Completion Rate" />
      <StatTile icon={ClipboardList} value={statistics.totalChallenges} label="Total Assignments" />
    </div>
  );
}
