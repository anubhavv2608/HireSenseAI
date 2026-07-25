import { z } from 'zod';

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
  }),
});

export const userListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    sort: z.enum(['newest', 'oldest']).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const patchUserSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  params: z.object({ id: z.string().min(1) }),
});

export const changeRoleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ role: z.enum(['student', 'admin', 'super_admin']) }),
});
