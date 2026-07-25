import { PdfExtractionService } from '../../shared/pdf/services/PdfExtractionService';
import { StorageFile } from '../../shared/storage/types';
import { BadRequestError } from '../../shared/errors/ApiError';
import { JOB_INPUT_CONSTANTS, JOB_INPUT_MESSAGES } from './job-input.constants';
import { ExtractJobDescriptionResult } from './job-input.types';

export class JobInputService {
  private pdfExtractionService: PdfExtractionService;

  constructor() {
    this.pdfExtractionService = new PdfExtractionService();
  }

  private validatePdfFile(file?: StorageFile): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestError(JOB_INPUT_MESSAGES.FILE_MISSING);
    }
    if (file.mimetype !== JOB_INPUT_CONSTANTS.ALLOWED_MIME_TYPES[0]) {
      throw new BadRequestError(JOB_INPUT_MESSAGES.INVALID_FILE_FORMAT);
    }
  }

  async extractFromPdf(file: StorageFile, correlationId?: string): Promise<ExtractJobDescriptionResult> {
    this.validatePdfFile(file);

    const extraction = await this.pdfExtractionService.extract(file.buffer, { correlationId });

    if (extraction.text.length === 0) {
      throw new BadRequestError(JOB_INPUT_MESSAGES.EMPTY_EXTRACTED_TEXT);
    }

    return {
      extractedText: extraction.text,
      metadata: {
        sourceType: 'pdf',
        originalFileName: file.originalname,
        characterCount: extraction.metadata.characterCount,
        wordCount: extraction.metadata.wordCount,
        pages: extraction.metadata.pages,
      },
    };
  }
}
