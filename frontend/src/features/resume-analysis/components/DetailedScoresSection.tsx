import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DetailedScoreEntry, ResumeAnalysisDetailedScores } from "../types/resumeAnalysis.types";

const DIMENSION_LABELS: Record<keyof ResumeAnalysisDetailedScores, string> = {
  atsCompatibility: "ATS Compatibility",
  resumeStructure: "Resume Structure",
  technicalSkills: "Technical Skills",
  projects: "Projects",
  experience: "Experience",
  education: "Education",
  achievementQuality: "Achievement Quality",
  overallScore: "Overall Score",
};

const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as (keyof ResumeAnalysisDetailedScores)[];

function ProseList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None identified.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DimensionDetail({ label, entry }: { label: string; entry: DetailedScoreEntry }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{entry.score}/100</p>
        </div>
        <Progress value={entry.score} />
        <p className="text-sm text-muted-foreground">{entry.explanation}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ProseList title="Strengths" items={entry.strengths} />
        <ProseList title="Weaknesses" items={entry.weaknesses} />
        <ProseList title="Improvements" items={entry.improvements} />
      </div>
    </div>
  );
}

interface DetailedScoresSectionProps {
  detailedScores: ResumeAnalysisDetailedScores | null;
}

export function DetailedScoresSection({ detailedScores }: DetailedScoresSectionProps) {
  if (!detailedScores) {
    return null;
  }

  return (
    <Tabs defaultValue="overallScore">
      <TabsList className="flex-wrap">
        {DIMENSION_KEYS.map((key) => (
          <TabsTrigger key={key} value={key}>
            {DIMENSION_LABELS[key]}
          </TabsTrigger>
        ))}
      </TabsList>
      {DIMENSION_KEYS.map((key) => (
        <TabsContent key={key} value={key} className="pt-4">
          <DimensionDetail label={DIMENSION_LABELS[key]} entry={detailedScores[key]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
