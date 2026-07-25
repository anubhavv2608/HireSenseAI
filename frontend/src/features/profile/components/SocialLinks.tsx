import { FolderGit2, Briefcase, Code2, Swords } from "lucide-react";

interface SocialLinksProps {
  github?: string;
  linkedin?: string;
  leetcode?: string;
  codeforces?: string;
}

const LINK_CLASS =
  "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SocialLinks({ github, linkedin, leetcode, codeforces }: SocialLinksProps) {
  const links = [
    { href: github, label: "GitHub", icon: FolderGit2 },
    { href: linkedin, label: "LinkedIn", icon: Briefcase },
    { href: leetcode, label: "LeetCode", icon: Code2 },
    { href: codeforces, label: "Codeforces", icon: Swords },
  ].filter((link) => !!link.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          className={LINK_CLASS}
        >
          <link.icon className="size-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
