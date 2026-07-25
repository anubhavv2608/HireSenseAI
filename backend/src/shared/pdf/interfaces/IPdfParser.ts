import { ParsedPdfContent, PdfParserOptions } from '../types';

export interface IPdfParser {
  readonly parserName: string;
  parse(buffer: Buffer, options?: PdfParserOptions): Promise<ParsedPdfContent>;
}
