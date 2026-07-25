import { JsonSchema, PromptDefinition } from '../../shared/ai';
import { IJobDescriptionAnalysisDocument } from '../job-description-analysis/job-description-analysis.schema';
import { StructuredResume } from '../resume-parser/resume-parser.structuredResume';
import { DIFFICULTY_VALUES, QUESTION_CATEGORY_VALUES } from './interview-generator.types';

export const buildInterviewGenerationPrompt = (
  structuredResume: StructuredResume,
  jobDescriptionAnalysis: IJobDescriptionAnalysisDocument | null
): PromptDefinition => {
  const system = jobDescriptionAnalysis
    ? 'You are a Senior Software Engineering Interviewer generating realistic, personalized interview ' +
      'questions. Use only information present in the structured resume data and the job description ' +
      'match analysis below. Never invent resume details that are not present in the data. Cover ' +
      'technical skills, projects, experience, education, leadership, behavioral, problem solving, and ' +
      'communication. Tailor the questions toward the target role using the matching skills, missing ' +
      'skills, and hiring recommendation from the match analysis. Whenever the resume data includes ' +
      "specific project names, technologies, or companies, reference them by name in the question " +
      'text and in `relatedSkill` rather than asking generically. Respond with JSON only, matching the ' +
      'provided schema exactly.'
    : 'You are a Senior Software Engineering Interviewer generating realistic, personalized interview ' +
      'questions strictly from a candidate\'s structured resume data. Never invent resume details that ' +
      'are not present in the data. Cover technical skills, projects, experience, education, ' +
      'leadership, behavioral, problem solving, and communication. Whenever the resume data includes ' +
      'specific project names, technologies, or companies, reference them by name in the question text ' +
      'and in `relatedSkill` rather than asking generically. Respond with JSON only, matching the ' +
      'provided schema exactly.';

  const user = jobDescriptionAnalysis
    ? 'Generate interview questions from the following structured resume data, tailored to the target ' +
      'role described by this job description match analysis.\n\nStructured resume data:\n' +
      '{{structuredResumeJson}}\n\nJob description match analysis:\n{{jobDescriptionAnalysisJson}}'
    : 'Generate interview questions from the following structured resume data only.\n\n' +
      'Structured resume data:\n{{structuredResumeJson}}';

  return {
    system,
    user,
    variables: {
      structuredResumeJson: JSON.stringify(structuredResume),
      ...(jobDescriptionAnalysis
        ? {
            jobDescriptionAnalysisJson: JSON.stringify({
              overallMatchScore: jobDescriptionAnalysis.overallMatchScore,
              summary: jobDescriptionAnalysis.summary,
              matchingSkills: jobDescriptionAnalysis.matchingSkills,
              missingSkills: jobDescriptionAnalysis.missingSkills,
              hiringRecommendation: jobDescriptionAnalysis.hiringRecommendation,
            }),
          }
        : {}),
    },
  };
};

// Hand-written in Gemini's own Schema format (plain string literals for `type`)
// - see resume-parser.structuredResume.ts for why this is not derived from the
// zod schema via z.toJSONSchema(). No @google/genai import.
const stringField: JsonSchema = { type: 'STRING' };
const numberField: JsonSchema = { type: 'NUMBER' };
const nullableStringField: JsonSchema = { type: 'STRING', nullable: true };
const difficultyField: JsonSchema = { type: 'STRING', enum: [...DIFFICULTY_VALUES] };

const interviewQuestionResponseSchema: JsonSchema = {
  type: 'OBJECT',
  properties: {
    question: stringField,
    category: { type: 'STRING', enum: [...QUESTION_CATEGORY_VALUES] },
    difficulty: difficultyField,
    reason: stringField,
    relatedSkill: nullableStringField,
  },
  required: ['question', 'category', 'difficulty', 'reason', 'relatedSkill'],
};

const questionArrayField: JsonSchema = { type: 'ARRAY', items: interviewQuestionResponseSchema };

export const interviewGenerationResponseSchema: JsonSchema = {
  type: 'OBJECT',
  properties: {
    overallDifficulty: difficultyField,
    estimatedInterviewDuration: numberField,
    technicalQuestions: questionArrayField,
    behavioralQuestions: questionArrayField,
    projectQuestions: questionArrayField,
    experienceQuestions: questionArrayField,
    followUpQuestions: questionArrayField,
  },
  required: [
    'overallDifficulty',
    'estimatedInterviewDuration',
    'technicalQuestions',
    'behavioralQuestions',
    'projectQuestions',
    'experienceQuestions',
    'followUpQuestions',
  ],
};
