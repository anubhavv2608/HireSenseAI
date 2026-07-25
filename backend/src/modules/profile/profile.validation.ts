import { z } from 'zod';
import { PROFILE_CONSTANTS, COLLEGE_TYPES } from './profile.constants';

const urlFieldSchema = z
  .string()
  .max(PROFILE_CONSTANTS.SOCIAL_URL_MAX_LENGTH, 'URL is too long')
  .trim()
  .or(z.string().length(0))
  .optional();

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .or(z.string().length(0))
  .optional();

function toTitleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

const skillsSchema = z
  .array(z.string().trim().max(PROFILE_CONSTANTS.MAX_SKILL_LENGTH, 'Skill name is too long'))
  .max(PROFILE_CONSTANTS.MAX_SKILLS, `Cannot have more than ${PROFILE_CONSTANTS.MAX_SKILLS} skills`)
  .transform((skills) => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of skills) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const titleCased = toTitleCase(trimmed);
      const key = titleCased.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(titleCased);
    }
    return result;
  })
  .optional();

const aboutSchema = z
  .string()
  .max(PROFILE_CONSTANTS.ABOUT_MAX_LENGTH, `About cannot exceed ${PROFILE_CONSTANTS.ABOUT_MAX_LENGTH} characters`)
  .trim()
  .transform((value) => value.replace(/\s+/g, ' '))
  .or(z.string().length(0))
  .optional();

export const profileBodySchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long').trim(),
  college: z.string().max(200, 'College name is too long').trim().optional(),
  collegeType: z.enum(COLLEGE_TYPES).optional(),
  degree: z.string().max(PROFILE_CONSTANTS.DEGREE_MAX_LENGTH, 'Degree is too long').trim().optional(),
  branch: z.string().max(100, 'Branch is too long').trim().optional(),
  graduationYear: z
    .number()
    .int()
    .min(PROFILE_CONSTANTS.MIN_GRADUATION_YEAR, `Graduation year must be >= ${PROFILE_CONSTANTS.MIN_GRADUATION_YEAR}`)
    .max(PROFILE_CONSTANTS.MAX_GRADUATION_YEAR, `Graduation year must be <= ${PROFILE_CONSTANTS.MAX_GRADUATION_YEAR}`)
    .optional(),
  cgpa: z
    .number()
    .min(PROFILE_CONSTANTS.MIN_CGPA, `CGPA must be >= ${PROFILE_CONSTANTS.MIN_CGPA}`)
    .max(PROFILE_CONSTANTS.MAX_CGPA, `CGPA must be <= ${PROFILE_CONSTANTS.MAX_CGPA}`)
    .optional(),
  phone: phoneSchema,
  linkedin: urlFieldSchema,
  github: urlFieldSchema,
  portfolioUrl: urlFieldSchema,
  leetcode: urlFieldSchema,
  codeforces: urlFieldSchema,
  targetRole: z.string().max(100, 'Target role is too long').trim().optional(),
  targetCompany: z.string().max(100, 'Target company is too long').trim().optional(),
  about: aboutSchema,
  skills: skillsSchema,
  receiveDailyDSAEmails: z.boolean().optional(),
});

export const createProfileSchema = z.object({
  body: profileBodySchema,
});

export const updateProfileSchema = z.object({
  body: profileBodySchema.partial(),
});

export const userIdParamSchema = z.object({
  params: z.object({ userId: z.string().min(1) }),
});

export const usernameParamSchema = z.object({
  params: z.object({ username: z.string().min(1) }),
});

export const searchProfilesSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    college: z.string().trim().optional(),
    branch: z.string().trim().optional(),
    graduationYear: z.coerce.number().int().optional(),
    skills: z
      .union([z.string(), z.array(z.string())])
      .transform((value) => (Array.isArray(value) ? value : [value]))
      .optional(),
    sort: z.enum(['newest', 'oldest', 'name']).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
