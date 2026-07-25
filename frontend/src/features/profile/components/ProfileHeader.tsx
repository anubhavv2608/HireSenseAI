import type { ReactNode } from "react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { SkillBadge } from "./SkillBadge";
import { SocialLinks } from "./SocialLinks";
import type { ProfilePicture } from "../types/profile.types";

interface ProfileHeaderProps {
  name: string;
  username?: string | null;
  email?: string;
  profilePicture?: ProfilePicture;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  about?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
  actions?: ReactNode;
}

export function ProfileHeader({
  name,
  username,
  email,
  profilePicture,
  college,
  degree,
  branch,
  graduationYear,
  about,
  skills,
  github,
  linkedin,
  leetcode,
  codeforces,
  actions,
}: ProfileHeaderProps) {
  const academicLine = [degree, branch].filter(Boolean).join(", ");
  const collegeLine = [college, graduationYear ? `Class of ${graduationYear}` : null].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <UserAvatar email={email ?? name} name={name} imageUrl={profilePicture?.url} size="lg" />
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold text-foreground">{name}</h1>
              {username && <span className="text-sm text-muted-foreground">@{username}</span>}
            </div>
            {email && <p className="text-sm text-muted-foreground">{email}</p>}
            {academicLine && <p className="text-sm text-muted-foreground">{academicLine}</p>}
            {collegeLine && <p className="text-sm text-muted-foreground">{collegeLine}</p>}
          </div>
        </div>
        {actions}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">About</h2>
        {about ? (
          <p className="text-sm text-muted-foreground">{about}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No about section yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Skills</h2>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </div>
        ) : (
          <EmptyState title="No skills added" className="border-none p-0 text-left" />
        )}
      </div>

      <SocialLinks github={github} linkedin={linkedin} leetcode={leetcode} codeforces={codeforces} />
    </div>
  );
}
