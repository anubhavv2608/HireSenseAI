export type JobSource = "text" | "pdf" | "image";

export interface ExtractedJobText {
  extractedText: string;
  metadata: {
    sourceType: "pdf";
    originalFileName: string;
    characterCount: number;
    wordCount: number;
    pages: number;
  };
}
