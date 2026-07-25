import { z } from 'zod';
import { DIFFICULTY_VALUES } from './daily-dsa.types';

const leetcodeUrlSchema = z
  .string()
  .trim()
  .min(1, 'LeetCode URL is required')
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .refine((value) => {
    try {
      return new URL(value).hostname.toLowerCase().endsWith('leetcode.com');
    } catch {
      return false;
    }
  }, 'Must be a valid LeetCode URL');

export const assignmentBodySchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  leetcodeProblemId: z.string().min(1, 'leetcodeProblemId is required').trim(),
  leetcodeUrl: leetcodeUrlSchema,
  difficulty: z.enum(DIFFICULTY_VALUES),
  topic: z.string().min(1, 'Topic is required').trim(),
  description: z.string().trim().optional(),
  date: z.coerce.date(),
});

export const createAssignmentSchema = z.object({
  body: assignmentBodySchema,
});

export const updateAssignmentSchema = z.object({
  body: assignmentBodySchema.partial(),
  params: z.object({ id: z.string().min(1) }),
});

export const assignmentIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const completeAssignmentSchema = z.object({
  body: z.object({ assignmentId: z.string().min(1, 'assignmentId is required') }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
