export type PromptVariables = Record<string, string | number | boolean>;

export interface PromptDefinition {
  system?: string;
  user: string;
  context?: string;
  instructions?: string[];
  variables?: PromptVariables;
  metadata?: Record<string, string>;
}

export type JsonSchema = Record<string, unknown>;

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  timeout?: number;
  responseFormat?: 'text' | 'json';
}

export interface ResolvedAIRequestOptions {
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  timeout: number;
}

export interface GenerateTextResult {
  text: string;
  model: string;
  provider: string;
}

export interface GenerateStructuredOutputResult<T = unknown> {
  data: T;
  model: string;
  provider: string;
}

export interface HealthCheckResult {
  available: boolean;
  provider: string;
  model: string;
  latencyMs?: number;
  error?: string;
}
