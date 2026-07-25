import { Link } from "react-router-dom";
import { Swords, Trophy, Upload, UserSearch } from "lucide-react";
import { ContentCard } from "@/components/common/ContentCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/routePaths";

export function QuickActionsCard({ hasResume }: { hasResume: boolean }) {
  return (
    <ContentCard title="Quick Actions">
      <div className="space-y-2">
        <Button asChild className="w-full justify-start gap-2">
          <Link to={ROUTES.RESUME}>
            <Upload className="size-4" />
            {hasResume ? "Replace Resume" : "Upload Resume"}
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to={ROUTES.STUDENT_SEARCH}>
            <UserSearch className="size-4" />
            Find Students
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to={ROUTES.LEADERBOARD}>
            <Trophy className="size-4" />
            View Leaderboard
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link to={ROUTES.CHALLENGES}>
            <Swords className="size-4" />
            Challenges
          </Link>
        </Button>
      </div>
    </ContentCard>
  );
}
