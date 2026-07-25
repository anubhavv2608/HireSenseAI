export interface PdfParserOptions {
  password?: string;
}

export interface ParsedPdfContent {
  text: string;
  pages: number;
  version?: string;
}

export interface PdfExtractionOptions extends PdfParserOptions {
  timeoutMs?: number;
  correlationId?: string;
}

export interface PdfMetadata {
  pages: number;
  characterCount: number;
  wordCount: number;
  durationMs: number;
  version?: string;
}

export interface PdfExtractionResult {
  text: string;
  metadata: PdfMetadata;
}
