import { z } from 'zod';
import { JsonSchema } from '../../shared/ai';

// Deliberately minimal: one flat, stable shape per section. Consistency over
// completeness — every section and every leaf field is nullable so the model
// is never forced to invent data for a resume that omits a section.
export const structuredResumeSchema = z.object({
  summary: z.string().nullable(),
  personalInformation: z
    .object({
      fullName: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      location: z.string().nullable(),
    })
    .nullable(),
  links: z
    .array(
      z.object({
        label: z.string().nullable(),
        url: z.string(),
      })
    )
    .nullable(),
  education: z
    .array(
      z.object({
        institution: z.string().nullable(),
        degree: z.string().nullable(),
        fieldOfStudy: z.string().nullable(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
      })
    )
    .nullable(),
  experience: z
    .array(
      z.object({
        company: z.string().nullable(),
        title: z.string().nullable(),
        startDate: z.string().nullable(),
        endDate: z.string().nullable(),
        description: z.string().nullable(),
      })
    )
    .nullable(),
  projects: z
    .array(
      z.object({
        name: z.string().nullable(),
        description: z.string().nullable(),
        technologies: z.array(z.string()).nullable(),
      })
    )
    .nullable(),
  skills: z.array(z.string()).nullable(),
  certifications: z
    .array(
      z.object({
        name: z.string().nullable(),
        issuer: z.string().nullable(),
        date: z.string().nullable(),
      })
    )
    .nullable(),
  achievements: z.array(z.string()).nullable(),
  positionsOfResponsibility: z
    .array(
      z.object({
        title: z.string().nullable(),
        organization: z.string().nullable(),
        description: z.string().nullable(),
      })
    )
    .nullable(),
  publications: z
    .array(
      z.object({
        title: z.string().nullable(),
        publisher: z.string().nullable(),
        date: z.string().nullable(),
      })
    )
    .nullable(),
  languages: z.array(z.string()).nullable(),
});

export type StructuredResume = z.infer<typeof structuredResumeSchema>;

// Hand-written in Gemini's own Schema format (plain string literals for `type`,
// boolean `nullable` — NOT JSON-Schema-2020-12's `anyOf` nullability). This is
// deliberately NOT derived from the zod schema above via z.toJSONSchema():
// zod's native JSON Schema output uses `anyOf: [X, {type:'null'}]` for nullable
// fields, which does not match what Gemini's `responseSchema` actually expects.
// Using plain string literals here (rather than @google/genai's `Type` enum)
// keeps this module free of any Gemini SDK import while remaining wire-identical
// at runtime (TS enums compile down to these same string values).
const nullableString: JsonSchema = { type: 'STRING', nullable: true };
const nullableStringArray: JsonSchema = {
  type: 'ARRAY',
  nullable: true,
  items: { type: 'STRING' },
};

const nullableObjectArray = (properties: Record<string, JsonSchema>, required: string[]): JsonSchema => ({
  type: 'ARRAY',
  nullable: true,
  items: {
    type: 'OBJECT',
    properties,
    required,
  },
});

export const structuredResumeResponseSchema: JsonSchema = {
  type: 'OBJECT',
  properties: {
    summary: nullableString,
    personalInformation: {
      type: 'OBJECT',
      nullable: true,
      properties: {
        fullName: nullableString,
        email: nullableString,
        phone: nullableString,
        location: nullableString,
      },
      required: ['fullName', 'email', 'phone', 'location'],
    },
    links: nullableObjectArray({ label: nullableString, url: { type: 'STRING' } }, ['label', 'url']),
    education: nullableObjectArray(
      {
        institution: nullableString,
        degree: nullableString,
        fieldOfStudy: nullableString,
        startDate: nullableString,
        endDate: nullableString,
      },
      ['institution', 'degree', 'fieldOfStudy', 'startDate', 'endDate']
    ),
    experience: nullableObjectArray(
      {
        company: nullableString,
        title: nullableString,
        startDate: nullableString,
        endDate: nullableString,
        description: nullableString,
      },
      ['company', 'title', 'startDate', 'endDate', 'description']
    ),
    projects: nullableObjectArray(
      { name: nullableString, description: nullableString, technologies: nullableStringArray },
      ['name', 'description', 'technologies']
    ),
    skills: nullableStringArray,
    certifications: nullableObjectArray({ name: nullableString, issuer: nullableString, date: nullableString }, [
      'name',
      'issuer',
      'date',
    ]),
    achievements: nullableStringArray,
    positionsOfResponsibility: nullableObjectArray(
      { title: nullableString, organization: nullableString, description: nullableString },
      ['title', 'organization', 'description']
    ),
    publications: nullableObjectArray({ title: nullableString, publisher: nullableString, date: nullableString }, [
      'title',
      'publisher',
      'date',
    ]),
    languages: nullableStringArray,
  },
  required: [
    'summary',
    'personalInformation',
    'links',
    'education',
    'experience',
    'projects',
    'skills',
    'certifications',
    'achievements',
    'positionsOfResponsibility',
    'publications',
    'languages',
  ],
};
