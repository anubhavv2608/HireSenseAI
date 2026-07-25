export const AI_DEFAULTS = {
  TOP_P: 0.95,
} as const;

export const AI_MESSAGES = {
  EMPTY_PROMPT: 'Prompt text must not be empty',
  UNKNOWN_PROVIDER: 'Unknown AI provider configured',
  AUTH_FAILED: 'AI provider authentication failed',
  RATE_LIMITED: 'AI provider rate limit exceeded',
  QUOTA_EXCEEDED: 'AI provider quota exceeded',
  TIMEOUT: 'AI provider request timed out',
  PROVIDER_UNAVAILABLE: 'AI provider is temporarily unavailable',
  EMPTY_RESPONSE: 'AI provider returned an empty response',
  INVALID_JSON: 'AI provider returned invalid JSON for structured output',
  GENERATION_FAILED: 'AI text generation failed',
} as const;
