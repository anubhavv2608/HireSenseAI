import {
  GenerateStructuredOutputResult,
  GenerateTextResult,
  HealthCheckResult,
  JsonSchema,
  PromptDefinition,
  ResolvedAIRequestOptions,
} from '../types';

export interface ILLMProvider {
  readonly providerName: string;
  generateText(prompt: PromptDefinition, options: ResolvedAIRequestOptions): Promise<GenerateTextResult>;
  generateStructuredOutput<T = unknown>(
    prompt: PromptDefinition,
    schema: JsonSchema,
    options: ResolvedAIRequestOptions
  ): Promise<GenerateStructuredOutputResult<T>>;
  healthCheck(): Promise<HealthCheckResult>;
}
