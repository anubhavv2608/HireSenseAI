import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { LeaderboardController } from './leaderboard.controller';
import { leaderboardQuerySchema } from './leaderboard.validation';

const router = Router();
const controller = new LeaderboardController();

router.use(authenticate);

/**
 * @openapi
 * /leaderboard:
 *   get:
 *     tags: [Leaderboard]
 *     summary: Get the Daily DSA leaderboard (overall, daily, weekly, or monthly)
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema: { type: string, enum: [overall, daily, weekly, monthly], default: overall }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated leaderboard, including the current user's rank.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/', validate(leaderboardQuerySchema), controller.getLeaderboard);

export default router;
