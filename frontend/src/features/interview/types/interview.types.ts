export type GenerationStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED" | "SKIPPED_ALREADY_GENERATED";

export type QuestionCategory =
  | "TECHNICAL_SKILLS"
  | "PROJECTS"
  | "EXPERIENCE"
  | "EDUCATION"
  | "LEADERSHIP"
  | "BEHAVIORAL"
  | "PROBLEM_SOLVING"
  | "COMMUNICATION";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface InterviewQuestion {
  question: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  reason: string;
  relatedSkill: string | null;
}

export interface InterviewGenerationResult {
  overallDifficulty: QuestionDifficulty;
  estimatedInterviewDuration: number;
  technicalQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  projectQuestions: InterviewQuestion[];
  experienceQuestions: InterviewQuestion[];
  followUpQuestions: InterviewQuestion[];
}

export interface InterviewGeneration {
  _id: string;
  resumeId: string;
  parseId: string;
  jobDescriptionAnalysisId: string | null;
  userId: string;
  generationStatus: GenerationStatus;
  generationVersion: number;
  promptVersion: number;
  provider: string | null;
  aiModel: string | null;
  questions: InterviewGenerationResult | null;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  lastAttemptedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  duplicateOfGenerationId: string | null;
  createdAt: string;
  updatedAt: string;
}

const COMPLETED_INTERVIEW_STATUSES: GenerationStatus[] = ["COMPLETED", "SKIPPED_ALREADY_GENERATED"];

export function isCompletedInterview(status: GenerationStatus): boolean {
  return COMPLETED_INTERVIEW_STATUSES.includes(status);
}
