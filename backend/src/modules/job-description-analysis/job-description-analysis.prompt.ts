import { JsonSchema, PromptDefinition } from '../../shared/ai';
import { PDF_LINK_CAVEAT } from '../../shared/ai/prompts/pdfLinkCaveat';
import { StructuredResume } from '../resume-parser/resume-parser.structuredResume';

export const buildJobDescriptionAnalysisPrompt = (
  structuredResume: StructuredResume,
  jobDescription: string
): PromptDefinition => ({
  system:
    "You are a senior technical recruiter comparing a candidate's resume against a job " +
    'description. Evaluate only the information explicitly present in both the structured ' +
    'resume data and the job description below - technical skill match, experience match, ' +
    'education match, project relevance, and keyword coverage. Never invent or infer skills, ' +
    'experience, or qualifications that are not present in the resume data - if a skill is not ' +
    'explicitly stated or strongly implied by the resume data, treat it as missing rather than ' +
    'guessing the candidate has it. Explain every mismatch you identify. Give specific, ' +
    'actionable recommendations. ' +
    `${PDF_LINK_CAVEAT} ` +
    'In addition to the resume-vs-JD comparison, extract an `extractedRequirements` object from ' +
    'the job description alone (independent of the resume): languages, frameworks, libraries, ' +
    'databases, responsibilities, requiredQualifications, preferredQualifications, and ' +
    'softSkills, each as a string array (empty array if the JD does not mention that category). ' +
    'Also produce a `learningRoadmap`: an ordered list of specific, actionable steps the ' +
    "candidate could take to close the gap between their resume and this JD's requirements, " +
    'grounded in the actual missing skills/qualifications you identified. Respond with JSON ' +
    'only, matching the provided schema exactly.',
  user:
    'Compare the following structured resume data against the job description and provide ' +
    'compatibility analysis.\n\nStructured resume data:\n{{structuredResumeJson}}\n\n' +
    'Job description:\n{{jobDescription}}',
  variables: {
    structuredResumeJson: JSON.stringify(structuredResume),
    jobDescription,
  },
});

// Hand-written in Gemini's own Schema format (plain string literals for `type`)
// - see resume-parser.structuredResume.ts for why this is not derived from the
// zod schema via z.toJSONSchema(). No @google/genai import.
const scoreField: JsonSchema = { type: 'NUMBER' };
const stringField: JsonSchema = { type: 'STRING' };
const stringArrayField: JsonSchema = { type: 'ARRAY', items: { type: 'STRING' } };

const extractedRequirementsField: JsonSchema = {
  type: 'OBJECT',
  properties: {
    languages: stringArrayField,
    frameworks: stringArrayField,
    libraries: stringArrayField,
    databases: stringArrayField,
    responsibilities: stringArrayField,
    requiredQualifications: stringArrayField,
    preferredQualifications: stringArrayField,
    softSkills: stringArrayField,
  },
  required: [
    'languages',
    'frameworks',
    'libraries',
    'databases',
    'responsibilities',
    'requiredQualifications',
    'preferredQualifications',
    'softSkills',
  ],
};

export const jobDescriptionAnalysisResponseSchema: JsonSchema = {
  type: 'OBJECT',
  properties: {
    overallMatchScore: scoreField,
    summary: stringField,
    matchingSkills: stringArrayField,
    missingSkills: stringArrayField,
    matchingExperience: stringArrayField,
    experienceGaps: stringArrayField,
    educationMatch: stringField,
    projectRelevance: stringField,
    keywordCoverage: scoreField,
    strengths: stringArrayField,
    weaknesses: stringArrayField,
    recommendations: stringArrayField,
    hiringRecommendation: { type: 'STRING', enum: ['STRONG_MATCH', 'GOOD_MATCH', 'PARTIAL_MATCH', 'WEAK_MATCH'] },
    priorityImprovements: stringArrayField,
    extractedRequirements: extractedRequirementsField,
    learningRoadmap: stringArrayField,
  },
  required: [
    'overallMatchScore',
    'summary',
    'matchingSkills',
    'missingSkills',
    'matchingExperience',
    'experienceGaps',
    'educationMatch',
    'projectRelevance',
    'keywordCoverage',
    'strengths',
    'weaknesses',
    'recommendations',
    'extractedRequirements',
    'learningRoadmap',
    'hiringRecommendation',
    'priorityImprovements',
  ],
};
