import { PromptDefinition, PromptVariables } from '../types';

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

const interpolate = (text: string, variables?: PromptVariables): string => {
  if (!variables) {
    return text;
  }
  return text.replace(VARIABLE_PATTERN, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
  );
};

export interface BuiltPrompt {
  systemInstruction?: string;
  userContent: string;
}

export const buildPrompt = (prompt: PromptDefinition): BuiltPrompt => {
  const systemInstruction = prompt.system ? interpolate(prompt.system, prompt.variables) : undefined;

  const sections: string[] = [];
  if (prompt.instructions?.length) {
    sections.push(prompt.instructions.join('\n'));
  }
  if (prompt.context) {
    sections.push(prompt.context);
  }
  sections.push(prompt.user);

  const userContent = interpolate(sections.join('\n\n'), prompt.variables);

  return { systemInstruction, userContent };
};
