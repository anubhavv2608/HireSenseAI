import { JsonSchema, PromptDefinition } from '../../shared/ai';
import { PDF_LINK_CAVEAT } from '../../shared/ai/prompts/pdfLinkCaveat';
import { StructuredResume } from '../resume-parser/resume-parser.structuredResume';
import { CATEGORY_SCORE_KEYS, DETAILED_SCORE_KEYS, STRUCTURED_RESUME_SECTIONS } from './resume-analysis.types';

export const buildResumeAnalysisPrompt = (structuredResume: StructuredResume): PromptDefinition => ({
  system:
    'You are an objective, constructive professional career coach reviewing a resume for a ' +
    'student or early-career job seeker. Evaluate only the information provided in the ' +
    'structured resume data below - completeness, formatting/structure quality implied by the ' +
    'data, project quality, experience quality, skills relevance, achievements, leadership, ' +
    'internal consistency, and overall presentation. Never invent or assume achievements, ' +
    'skills, or experience that are not present in the data. Never recommend adding a section ' +
    '(projects, skills, education, certifications, etc.) that is already present in the data - ' +
    'only flag a section as missing if it is genuinely absent. Be specific and actionable in ' +
    'recommendations, and explain WHY each recommendation matters, not just what to change. ' +
    'Avoid generic, boilerplate advice; every point must be grounded in this specific resume. ' +
    `${PDF_LINK_CAVEAT} ` +
    'In addition to the overall score, category scores, strengths, weaknesses and ' +
    'recommendations, produce a `detailedScores` object with exactly these eight dimensions: ' +
    `${DETAILED_SCORE_KEYS.join(', ')}. Each dimension must include its own numeric score (0-100), ` +
    'a short explanation of the score, specific strengths, specific weaknesses, and specific ' +
    'improvement suggestions - all grounded only in this resume, never generic. Scores should ' +
    'reflect consistent judgment - a resume with the same content should receive materially the ' +
    'same scores if evaluated again. Respond with JSON only, matching the provided schema exactly.',
  user: 'Analyze the following structured resume data and provide feedback:\n\n{{structuredResumeJson}}',
  variables: { structuredResumeJson: JSON.stringify(structuredResume) },
});

// Hand-written in Gemini's own Schema format (plain string literals for `type`,
// boolean `nullable`) - see resume-parser.structuredResume.ts for why this is
// not derived from the zod schema via z.toJSONSchema(). No @google/genai import.
const scoreField: JsonSchema = { type: 'NUMBER' };
const stringArrayField: JsonSchema = { type: 'ARRAY', items: { type: 'STRING' } };

const detailedScoreEntryField: JsonSchema = {
  type: 'OBJECT',
  properties: {
    score: scoreField,
    explanation: { type: 'STRING' },
    strengths: stringArrayField,
    weaknesses: stringArrayField,
    improvements: stringArrayField,
  },
  required: ['score', 'explanation', 'strengths', 'weaknesses', 'improvements'],
};

export const resumeAnalysisResponseSchema: JsonSchema = {
  type: 'OBJECT',
  properties: {
    overallScore: scoreField,
    summary: { type: 'STRING' },
    strengths: stringArrayField,
    weaknesses: stringArrayField,
    recommendations: stringArrayField,
    categoryScores: {
      type: 'OBJECT',
      properties: Object.fromEntries(CATEGORY_SCORE_KEYS.map((key) => [key, scoreField])),
      required: [...CATEGORY_SCORE_KEYS],
    },
    detailedScores: {
      type: 'OBJECT',
      properties: Object.fromEntries(DETAILED_SCORE_KEYS.map((key) => [key, detailedScoreEntryField])),
      required: [...DETAILED_SCORE_KEYS],
    },
    // Constrained to the exact StructuredResume keys via `enum`, not a plain
    // stringArrayField: without this, the model returns human-readable labels
    // (e.g. "Certifications") that fail the zod enum check on the exact
    // camelCase section keys (e.g. "certifications").
    missingSections: { type: 'ARRAY', items: { type: 'STRING', enum: [...STRUCTURED_RESUME_SECTIONS] } },
    priorityImprovements: stringArrayField,
  },
  required: [
    'overallScore',
    'summary',
    'strengths',
    'weaknesses',
    'recommendations',
    'categoryScores',
    'detailedScores',
    'missingSections',
    'priorityImprovements',
  ],
};
