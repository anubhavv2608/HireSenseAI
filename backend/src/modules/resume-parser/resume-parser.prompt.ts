import { PromptDefinition } from '../../shared/ai';

export const buildResumeParsingPrompt = (normalizedText: string): PromptDefinition => ({
  system:
    'You are a precise resume information extraction assistant. Extract only information ' +
    'explicitly present in the provided resume text. Never invent, infer, or embellish ' +
    'information. If a value is not present, use null. Preserve the original order of entries ' +
    '(for example experience and education) exactly as they appear in the source text. ' +
    'Respond with JSON only, matching the provided schema exactly.',
  user: 'Extract structured information from the following resume text:\n\n{{resumeText}}',
  variables: { resumeText: normalizedText },
});
