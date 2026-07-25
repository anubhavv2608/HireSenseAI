import { z } from 'zod';

export const resumeIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resume ID is required'),
  }),
});
