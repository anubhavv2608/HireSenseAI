export type TimelineStage =
  | "RESUME_UPLOADED"
  | "RESUME_PARSED"
  | "RESUME_ANALYZED"
  | "JD_COMPARED"
  | "INTERVIEW_GENERATED";

export interface TimelineEntry {
  stage: TimelineStage;
  completed: boolean;
  completedAt: string | null;
}

export interface LatestResumeSummary {
  id: string;
  originalFilename: string;
  version: number;
  uploadedAt: string;
}

export interface DashboardSummary {
  latestResume: LatestResumeSummary | null;
  latestParseStatus: string | null;
  latestResumeScore: number | null;
  latestJDMatchScore: number | null;
  latestInterviewGeneration: {
    id: string;
    generationStatus: string;
    overallDifficulty: string | null;
    estimatedInterviewDuration: number | null;
    generationCompletedAt: string | null;
  } | null;
  overallCompletion: number;
  timeline: TimelineEntry[];
}
