import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import { BadRequestError, InternalServerError } from '../../errors/ApiError';
import { PDF_CONSTANTS, PDF_MESSAGES } from '../constants';
import { IPdfParser } from '../interfaces/IPdfParser';
import { PdfExtractionOptions, PdfExtractionResult } from '../types';
import { countWords, normalizeExtractedText } from '../utils/normalization';
import { PdfParseParser } from './PdfParseParser';

export class PdfExtractionService {
  private parser: IPdfParser;

  constructor(parser?: IPdfParser) {
    this.parser = parser || new PdfParseParser();
  }

  setParser(parser: IPdfParser): void {
    this.parser = parser;
  }

  async extract(buffer: Buffer, options?: PdfExtractionOptions): Promise<PdfExtractionResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError(PDF_MESSAGES.EMPTY_BUFFER);
    }

    const correlationId = options?.correlationId || randomUUID();
    const timeoutMs = options?.timeoutMs || PDF_CONSTANTS.DEFAULT_TIMEOUT_MS;
    const startedAt = Date.now();

    logger.info(`[PdfExtraction] Starting extraction via ${this.parser.parserName} [CorrelationID: ${correlationId}]`);

    try {
      const parsed = await this.withTimeout(
        this.parser.parse(buffer, { password: options?.password }),
        timeoutMs
      );
      const text = normalizeExtractedText(parsed.text);
      const durationMs = Date.now() - startedAt;

      if (text.length === 0) {
        logger.warn(`[PdfExtraction] No extractable text found in PDF [CorrelationID: ${correlationId}]`);
      }

      logger.info(
        `[PdfExtraction] Completed - ${parsed.pages} pages, ${text.length} chars - ${durationMs}ms [CorrelationID: ${correlationId}]`
      );

      return {
        text,
        metadata: {
          pages: parsed.pages,
          characterCount: text.length,
          wordCount: countWords(text),
          durationMs,
          version: parsed.version,
        },
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      if (error instanceof BadRequestError) {
        logger.warn(`[PdfExtraction] Failed - ${error.message} - ${durationMs}ms [CorrelationID: ${correlationId}]`);
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[PdfExtraction] Unexpected failure - ${durationMs}ms [CorrelationID: ${correlationId}] - ${message}`);
      throw new InternalServerError(PDF_MESSAGES.EXTRACTION_FAILED);
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new BadRequestError(PDF_MESSAGES.PARSE_TIMEOUT));
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
