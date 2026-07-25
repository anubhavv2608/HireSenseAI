import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./DifficultyBadge";
import type { DailyAssignment } from "../types/dailyDsa.types";

interface ProblemCardProps {
  assignment: DailyAssignment;
}

export function ProblemCard({ assignment }: ProblemCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
        <DifficultyBadge difficulty={assignment.difficulty} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{assignment.topic}</Badge>
      </div>

      {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}

      <Button asChild variant="outline" size="sm">
        <a href={assignment.leetcodeUrl} target="_blank" rel="noopener noreferrer">
          Solve on LeetCode
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}
