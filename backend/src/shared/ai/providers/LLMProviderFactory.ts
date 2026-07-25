import { InternalServerError } from '../../errors/ApiError';
import { AI_MESSAGES } from '../constants';
import { ILLMProvider } from '../interfaces/ILLMProvider';
import { GeminiProvider } from './GeminiProvider';

export const createLLMProvider = (providerName: string): ILLMProvider => {
  switch (providerName) {
    case 'gemini':
      return new GeminiProvider();
    default:
      throw new InternalServerError(`${AI_MESSAGES.UNKNOWN_PROVIDER}: ${providerName}`);
  }
};
