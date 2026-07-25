import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { DailyDsaController } from './daily-dsa.controller';
import { completeAssignmentSchema, paginationQuerySchema } from './daily-dsa.validation';

const router = Router();
const controller = new DailyDsaController();

router.use(authenticate);

/**
 * @openapi
 * /daily-dsa/today:
 *   get:
 *     tags: [Daily DSA]
 *     summary: Get today's Daily DSA assignment and the user's completion status
 *     responses:
 *       200:
 *         description: Today's assignment.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/today', controller.getToday);

/**
 * @openapi
 * /daily-dsa/history:
 *   get:
 *     tags: [Daily DSA]
 *     summary: Get the user's Daily DSA completion history
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated completion history.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/history', validate(paginationQuerySchema), controller.getHistory);

/**
 * @openapi
 * /daily-dsa/complete:
 *   post:
 *     tags: [Daily DSA]
 *     summary: Mark a Daily DSA assignment as completed (updates streak)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentId]
 *             properties: { assignmentId: { type: string } }
 *     responses:
 *       200:
 *         description: Marked complete.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/complete', validate(completeAssignmentSchema), controller.complete);

/**
 * @openapi
 * /daily-dsa/enable:
 *   post:
 *     tags: [Daily DSA]
 *     summary: Opt the current user into Daily DSA (enables streak tracking + leaderboard eligibility)
 *     responses:
 *       200:
 *         description: Daily DSA enabled.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/enable', controller.enable);

export default router;
