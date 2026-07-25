import { logger } from '../../config/logger';
import { BadRequestError } from '../../errors/ApiError';
import { aiConfig } from '../config';
import { AI_DEFAULTS, AI_MESSAGES } from '../constants';
import { isRetryableError } from '../errors/mapProviderError';
import { ILLMProvider } from '../interfaces/ILLMProvider';
import { createLLMProvider } from '../providers/LLMProviderFactory';
import {
  AIRequestOptions,
  GenerateStructuredOutputResult,
  GenerateTextResult,
  HealthCheckResult,
  JsonSchema,
  PromptDefinition,
  ResolvedAIRequestOptions,
} from '../types';
import { executeWithRetry } from '../utils/retry';

export class AIService {
  private provider: ILLMProvider;

  constructor(provider?: ILLMProvider) {
    this.provider = provider || createLLMProvider(aiConfig.provider);
  }

  async generateText(prompt: PromptDefinition, options?: AIRequestOptions): Promise<GenerateTextResult> {
    this.validatePrompt(prompt);
    const resolved = this.resolveOptions(options);
    return this.runWithRetry(() => this.provider.generateText(prompt, resolved), resolved.model);
  }

  async generateStructuredOutput<T = unknown>(
    prompt: PromptDefinition,
    schema: JsonSchema,
    options?: AIRequestOptions
  ): Promise<GenerateStructuredOutputResult<T>> {
    this.validatePrompt(prompt);
    const resolved = this.resolveOptions(options);
    return this.runWithRetry(() => this.provider.generateStructuredOutput<T>(prompt, schema, resolved), resolved.model);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return this.provider.healthCheck();
  }

  private validatePrompt(prompt: PromptDefinition): void {
    if (!prompt.user || prompt.user.trim().length === 0) {
      throw new BadRequestError(AI_MESSAGES.EMPTY_PROMPT);
    }
  }

  private resolveOptions(options?: AIRequestOptions): ResolvedAIRequestOptions {
    return {
      model: options?.model || aiConfig.model,
      temperature: options?.temperature ?? aiConfig.temperature,
      topP: options?.topP ?? AI_DEFAULTS.TOP_P,
      maxTokens: options?.maxTokens,
      timeout: options?.timeout || aiConfig.timeoutMs,
    };
  }

  private async runWithRetry<T>(fn: () => Promise<T>, model: string): Promise<T> {
    const startedAt = Date.now();
    logger.info(`[AIService] Request started [Provider: ${this.provider.providerName}] [Model: ${model}]`);

    try {
      const result = await executeWithRetry(fn, {
        maxRetries: aiConfig.maxRetries,
        isRetryable: isRetryableError,
        onRetry: (attempt, error) => {
          const message = error instanceof Error ? error.message : 'unknown error';
          logger.warn(
            `[AIService] Retrying request (attempt ${attempt}/${aiConfig.maxRetries}) [Provider: ${this.provider.providerName}] - ${message}`
          );
        },
      });

      logger.info(
        `[AIService] Request completed - ${Date.now() - startedAt}ms [Provider: ${this.provider.providerName}] [Model: ${model}]`
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      logger.error(
        `[AIService] Request failed - ${Date.now() - startedAt}ms [Provider: ${this.provider.providerName}] [Model: ${model}] - ${message}`
      );
      throw error;
    }
  }
}
