const normalizeLineEndings = (text: string): string => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const collapseTabs = (text: string): string => text.replace(/\t+/g, ' ');

const collapseSpaces = (text: string): string => text.replace(/[ \u00A0]{2,}/g, ' ');

const collapseBlankLines = (text: string): string => text.replace(/\n{3,}/g, '\n\n');

const trimLines = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

const NORMALIZATION_PIPELINE: Array<(text: string) => string> = [
  normalizeLineEndings,
  collapseTabs,
  collapseSpaces,
  trimLines,
  collapseBlankLines,
];

export const normalizeExtractedText = (raw: string): string => {
  if (!raw) {
    return '';
  }
  return NORMALIZATION_PIPELINE.reduce((text, step) => step(text), raw).trim();
};

export const countWords = (text: string): number => {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
};
