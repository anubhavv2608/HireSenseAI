import { z } from 'zod';
import { SCOPE_VALUES } from './leaderboard.constants';

export const leaderboardQuerySchema = z.object({
  query: z.object({
    scope: z.enum(SCOPE_VALUES).default('overall'),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
