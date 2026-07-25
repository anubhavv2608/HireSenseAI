import { GoogleGenAI } from '@google/genai';
import { InternalServerError } from '../../errors/ApiError';
import { aiConfig } from '../config';
import { AI_MESSAGES } from '../constants';
import { mapProviderError } from '../errors/mapProviderError';
import { ILLMProvider } from '../interfaces/ILLMProvider';
import { buildPrompt } from '../prompts/promptBuilder';
import {
  GenerateStructuredOutputResult,
  GenerateTextResult,
  HealthCheckResult,
  JsonSchema,
  PromptDefinition,
  ResolvedAIRequestOptions,
} from '../types';

export class GeminiProvider implements ILLMProvider {
  readonly providerName = 'gemini';
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: aiConfig.geminiApiKey });
  }

  async generateText(prompt: PromptDefinition, options: ResolvedAIRequestOptions): Promise<GenerateTextResult> {
    const { systemInstruction, userContent } = buildPrompt(prompt);

    let text: string | undefined;
    try {
      const response = await this.client.models.generateContent({
        model: options.model,
        contents: userContent,
        config: {
          systemInstruction,
          temperature: options.temperature,
          topP: options.topP,
          maxOutputTokens: options.maxTokens,
          httpOptions: { timeout: options.timeout },
        },
      });
      text = response.text;
    } catch (error) {
      throw mapProviderError(error);
    }

    if (!text) {
      throw new InternalServerError(AI_MESSAGES.EMPTY_RESPONSE);
    }

    return { text, model: options.model, provider: this.providerName };
  }

  async generateStructuredOutput<T = unknown>(
    prompt: PromptDefinition,
    schema: JsonSchema,
    options: ResolvedAIRequestOptions
  ): Promise<GenerateStructuredOutputResult<T>> {
    const { systemInstruction, userContent } = buildPrompt(prompt);

    let text: string | undefined;
    try {
      const response = await this.client.models.generateContent({
        model: options.model,
        contents: userContent,
        config: {
          systemInstruction,
          temperature: options.temperature,
          topP: options.topP,
          maxOutputTokens: options.maxTokens,
          responseMimeType: 'application/json',
          responseSchema: schema,
          httpOptions: { timeout: options.timeout },
        },
      });
      text = response.text;
    } catch (error) {
      throw mapProviderError(error);
    }

    if (!text) {
      throw new InternalServerError(AI_MESSAGES.EMPTY_RESPONSE);
    }

    try {
      const data = JSON.parse(text) as T;
      return { data, model: options.model, provider: this.providerName };
    } catch {
      throw new InternalServerError(AI_MESSAGES.INVALID_JSON);
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startedAt = Date.now();
    try {
      await this.client.models.get({ model: aiConfig.model });
      return {
        available: true,
        provider: this.providerName,
        model: aiConfig.model,
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      const mapped = mapProviderError(error);
      return {
        available: false,
        provider: this.providerName,
        model: aiConfig.model,
        latencyMs: Date.now() - startedAt,
        error: mapped.message,
      };
    }
  }
}
