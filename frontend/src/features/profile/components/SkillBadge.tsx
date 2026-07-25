import { Badge } from "@/components/ui/badge";

export function SkillBadge({ skill, className }: { skill: string; className?: string }) {
  return (
    <Badge variant="outline" className={className}>
      {skill}
    </Badge>
  );
}
