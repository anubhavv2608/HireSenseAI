import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  query: z.object({
    unreadOnly: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
