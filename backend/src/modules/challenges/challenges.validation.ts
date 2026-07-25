import { z } from 'zod';
import { CHALLENGE_DIFFICULTIES, CHALLENGE_LIST_TYPES } from './challenges.constants';

export const createChallengeSchema = z.object({
  body: z.object({
    opponentUserId: z.string().min(1),
    problem: z.object({
      title: z.string().min(1).max(200),
      url: z.string().trim().max(500).optional(),
      difficulty: z.enum(CHALLENGE_DIFFICULTIES).optional(),
      notes: z.string().trim().max(1000).optional(),
    }),
  }),
});

export const challengeIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listChallengesQuerySchema = z.object({
  query: z.object({
    type: z.enum(CHALLENGE_LIST_TYPES).default('incoming'),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
