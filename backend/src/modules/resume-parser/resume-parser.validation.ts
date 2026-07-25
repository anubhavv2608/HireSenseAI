import { z } from 'zod';

export const parseResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, 'resumeId is required'),
  }),
});

export const resumeIdParamSchema = z.object({
  params: z.object({
    resumeId: z.string().min(1, 'resumeId is required'),
  }),
});
