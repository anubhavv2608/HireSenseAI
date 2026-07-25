import { InvalidPDFException, PasswordException, PDFParse } from 'pdf-parse';
import { BadRequestError } from '../../errors/ApiError';
import { PDF_MESSAGES } from '../constants';
import { IPdfParser } from '../interfaces/IPdfParser';
import { ParsedPdfContent, PdfParserOptions } from '../types';

export class PdfParseParser implements IPdfParser {
  readonly parserName = 'pdf-parse';

  async parse(buffer: Buffer, options?: PdfParserOptions): Promise<ParsedPdfContent> {
    const parser = new PDFParse({ data: buffer, password: options?.password });

    try {
      // getText() and getInfo() share the same underlying worker transfer of the
      // document buffer; running them concurrently races and throws
      // "Cannot transfer object of unsupported type", so they must run sequentially.
      const textResult = await parser.getText({ pageJoiner: '\n\n' });
      const infoResult = await parser.getInfo();

      return {
        text: textResult.text,
        pages: textResult.total,
        version: infoResult.info?.PDFFormatVersion,
      };
    } catch (error) {
      if (error instanceof PasswordException) {
        throw new BadRequestError(PDF_MESSAGES.ENCRYPTED_PDF);
      }
      if (error instanceof InvalidPDFException) {
        throw new BadRequestError(PDF_MESSAGES.CORRUPTED_PDF);
      }
      throw error;
    } finally {
      await parser.destroy();
    }
  }
}
