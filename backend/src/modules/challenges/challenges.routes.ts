import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ChallengesController } from './challenges.controller';
import { createChallengeSchema, challengeIdParamSchema, listChallengesQuerySchema } from './challenges.validation';

const router = Router();
const controller = new ChallengesController();

router.use(authenticate);

/**
 * @openapi
 * /challenges:
 *   post:
 *     tags: [Challenges]
 *     summary: Challenge another user (friend or any student) to solve a problem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [opponentUserId, problem]
 *             properties:
 *               opponentUserId: { type: string }
 *               problem:
 *                 type: object
 *                 required: [title]
 *                 properties:
 *                   title: { type: string }
 *                   url: { type: string }
 *                   difficulty: { type: string, enum: [Easy, Medium, Hard] }
 *                   notes: { type: string }
 *     responses:
 *       201:
 *         description: Challenge created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 *   get:
 *     tags: [Challenges]
 *     summary: List challenges by type (incoming, outgoing, active, completed)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [incoming, outgoing, active, completed], default: incoming }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated challenges.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/', validate(createChallengeSchema), controller.create);
router.get('/', validate(listChallengesQuerySchema), controller.list);

/**
 * @openapi
 * /challenges/{id}/accept:
 *   post:
 *     tags: [Challenges]
 *     summary: Accept a pending challenge (as the opponent)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Challenge accepted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/:id/accept', validate(challengeIdParamSchema), controller.accept);

/**
 * @openapi
 * /challenges/{id}/decline:
 *   post:
 *     tags: [Challenges]
 *     summary: Decline a pending challenge (as the opponent)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Challenge declined.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/:id/decline', validate(challengeIdParamSchema), controller.decline);

/**
 * @openapi
 * /challenges/{id}/cancel:
 *   post:
 *     tags: [Challenges]
 *     summary: Cancel a pending challenge (as the challenger)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Challenge cancelled.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/:id/cancel', validate(challengeIdParamSchema), controller.cancel);

/**
 * @openapi
 * /challenges/{id}/complete:
 *   post:
 *     tags: [Challenges]
 *     summary: Mark the current user's side of an accepted challenge as complete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked complete (challenge finishes once both sides complete).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/:id/complete', validate(challengeIdParamSchema), controller.complete);

/**
 * @openapi
 * /challenges/{id}:
 *   get:
 *     tags: [Challenges]
 *     summary: Get a single challenge by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Challenge.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:id', validate(challengeIdParamSchema), controller.getOne);

export default router;
