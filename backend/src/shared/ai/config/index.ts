import { config } from '../../config';

export const aiConfig = {
  provider: config.ai.provider,
  model: config.ai.model,
  timeoutMs: config.ai.timeoutMs,
  maxRetries: config.ai.maxRetries,
  temperature: config.ai.temperature,
  geminiApiKey: config.gemini.apiKey,
} as const;
