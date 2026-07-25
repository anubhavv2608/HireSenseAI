import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  body: z.object({ targetUserId: z.string().min(1) }),
});

export const friendRequestIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const friendUserIdParamSchema = z.object({
  params: z.object({ userId: z.string().min(1) }),
});

export const listFriendsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const listFriendRequestsQuerySchema = z.object({
  query: z.object({
    type: z.enum(['incoming', 'outgoing']).default('incoming'),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
