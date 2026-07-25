import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { InterviewGeneratorController } from './interview-generator.controller';
import { generateInterviewSchema, resumeIdParamSchema } from './interview-generator.validation';

const router = Router();
const controller = new InterviewGeneratorController();

// All interview-generator routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /interview-generator/generate:
 *   post:
 *     tags: [Interview Generator]
 *     summary: Generate AI interview questions grounded in a resume (and JD analysis, if available)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId]
 *             properties: { resumeId: { type: string } }
 *     responses:
 *       200:
 *         description: Generation started (or cached result reused).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/generate', validate(generateInterviewSchema), controller.generate);

/**
 * @openapi
 * /interview-generator/regenerate:
 *   post:
 *     tags: [Interview Generator]
 *     summary: Force fresh question generation, bypassing any cached result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId]
 *             properties: { resumeId: { type: string } }
 *     responses:
 *       200:
 *         description: Regeneration started.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/regenerate', validate(generateInterviewSchema), controller.regenerate);

/**
 * @openapi
 * /interview-generator/status/{resumeId}:
 *   get:
 *     tags: [Interview Generator]
 *     summary: Get the question-generation status for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generation status.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/status/:resumeId', validate(resumeIdParamSchema), controller.getStatus);

/**
 * @openapi
 * /interview-generator/{resumeId}:
 *   get:
 *     tags: [Interview Generator]
 *     summary: Get the generated interview questions for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Interview question record.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:resumeId', validate(resumeIdParamSchema), controller.getRecord);

export default router;
