import { ContentCard } from "@/components/common/ContentCard";
import { Progress } from "@/components/ui/progress";

export function ProfileCompletion({ percentage }: { percentage: number }) {
  return (
    <ContentCard title="Profile Completion">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Complete your profile</span>
          <span className="font-medium text-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} />
        {percentage < 100 && (
          <p className="text-sm text-muted-foreground">
            Add more details to your profile to help other students find and connect with you.
          </p>
        )}
      </div>
    </ContentCard>
  );
}
