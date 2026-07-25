import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  score: number;
  label: string;
  description?: string;
  className?: string;
}

export function ScoreCard({ score, label, description, className }: ScoreCardProps) {
  return (
    <Card className={className}>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-4xl font-semibold text-foreground">
          {score}
          <span className="text-lg font-normal text-muted-foreground">/100</span>
        </p>
        <Progress value={score} />
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
