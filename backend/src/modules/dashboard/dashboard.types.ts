export type DashboardStageName =
  | 'RESUME_UPLOADED'
  | 'RESUME_PARSED'
  | 'RESUME_ANALYZED'
  | 'JD_COMPARED'
  | 'INTERVIEW_GENERATED';

export interface DashboardTimelineStage {
  stage: DashboardStageName;
  completed: boolean;
  completedAt: Date | null;
}

export interface DashboardLatestResume {
  id: string;
  originalFilename: string;
  version: number;
  uploadedAt: Date;
}

export interface DashboardLatestInterviewGeneration {
  id: string;
  generationStatus: string;
  overallDifficulty: string | null;
  estimatedInterviewDuration: number | null;
  generationCompletedAt: Date | null;
}

export interface DashboardSummary {
  latestResume: DashboardLatestResume | null;
  latestParseStatus: string | null;
  latestResumeScore: number | null;
  latestJDMatchScore: number | null;
  latestInterviewGeneration: DashboardLatestInterviewGeneration | null;
  overallCompletion: number;
  timeline: DashboardTimelineStage[];
}
