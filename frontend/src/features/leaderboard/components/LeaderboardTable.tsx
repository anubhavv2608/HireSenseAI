import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { publicProfilePath } from "@/routes/routePaths";
import type { LeaderboardRow } from "../types/leaderboard.types";

const MEDAL_COLORS: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-amber-700",
};

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  currentUserId?: string;
}

export function LeaderboardTable({ rows, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {rows.map((row) => {
        const isCurrentUser = row.userId === currentUserId;
        return (
          <Link
            key={row.userId}
            to={publicProfilePath(row.userId, row.username)}
            className={cn(
              "flex items-center gap-3 p-3 transition-colors hover:bg-muted",
              isCurrentUser && "bg-primary/5",
            )}
          >
            <div className="flex w-8 shrink-0 items-center justify-center">
              {row.rank <= 3 ? (
                <Trophy className={cn("size-4", MEDAL_COLORS[row.rank])} aria-hidden="true" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{row.rank}</span>
              )}
            </div>
            <UserAvatar email={row.userId} name={row.fullName ?? row.username ?? undefined} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {row.fullName ?? (row.username ? `@${row.username}` : "Unknown")}
                {isCurrentUser && <span className="ml-2 text-xs text-primary">(you)</span>}
              </p>
              {row.username && row.fullName && <p className="truncate text-sm text-muted-foreground">@{row.username}</p>}
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="font-medium text-foreground">{row.totalCompleted} solved</p>
              <p className="text-muted-foreground">{row.currentStreak} day streak</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
