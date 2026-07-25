import { Link } from "react-router-dom";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SkillBadge } from "./SkillBadge";
import { FriendActionButton } from "@/features/friends/components/FriendActionButton";
import { ChallengeActionButton } from "@/features/challenges/components/ChallengeActionButton";
import { publicProfilePath } from "@/routes/routePaths";
import type { StudentCard as StudentCardData } from "../types/profile.types";

const TOP_SKILLS_COUNT = 4;

export function StudentCard({ student }: { student: StudentCardData }) {
  const topSkills = student.skills.slice(0, TOP_SKILLS_COUNT);
  const details = [student.college, student.branch, student.graduationYear ? `Class of ${student.graduationYear}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted">
      <Link
        to={publicProfilePath(student.userId, student.username)}
        className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar email={student.userId} name={student.name} imageUrl={student.profilePicture?.url} />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{student.name}</p>
          {student.username && <p className="truncate text-sm text-muted-foreground">@{student.username}</p>}
          {details && <p className="truncate text-sm text-muted-foreground">{details}</p>}
        </div>
      </Link>
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <FriendActionButton targetUserId={student.userId} />
        <ChallengeActionButton targetUserId={student.userId} targetName={student.name} />
      </div>
    </div>
  );
}
