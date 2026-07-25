import { FileText, Flame, Swords, Trophy } from "lucide-react";
import { StatTile } from "@/components/common/StatTile";
import { useResumeHistory } from "@/features/resume/hooks/useResumeHistory";
import { useChallenges } from "@/features/challenges/hooks/useChallenges";
import { useLeaderboard } from "@/features/leaderboard/hooks/useLeaderboard";

const LEADERBOARD_PREVIEW_LIMIT = 5;

export function DashboardStatsRow() {
  const resumeHistory = useResumeHistory();
  const incomingChallenges = useChallenges("incoming", 1);
  const activeChallenges = useChallenges("active", 1);
  const leaderboard = useLeaderboard({ scope: "overall", page: 1, limit: LEADERBOARD_PREVIEW_LIMIT });

  const resumeCount = resumeHistory.data?.length ?? 0;
  const challengeCount = (incomingChallenges.data?.meta.total ?? 0) + (activeChallenges.data?.meta.total ?? 0);
  const streak = leaderboard.data?.currentUserPosition.currentStreak ?? 0;
  const rank = leaderboard.data?.currentUserPosition.rank;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile icon={FileText} value={resumeCount} label="Resumes" />
      <StatTile icon={Swords} value={challengeCount} label="Challenges" />
      <StatTile icon={Flame} value={`${streak}d`} label="DSA Streak" />
      <StatTile icon={Trophy} value={rank ? `#${rank}` : "—"} label="Leaderboard Rank" />
    </div>
  );
}
