import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ResumeProcessingController } from './resume-processing.controller';
import { processResumeSchema, resumeIdParamSchema } from './resume-processing.validation';

const router = Router();
const controller = new ResumeProcessingController();

// All resume-processing routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /resume-processing/process:
 *   post:
 *     tags: [Resume Processing]
 *     summary: Run the full processing pipeline (parse + analyze) for a resume
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
 *         description: Processing started (or cached result reused).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/process', validate(processResumeSchema), controller.process);

/**
 * @openapi
 * /resume-processing/status/{resumeId}:
 *   get:
 *     tags: [Resume Processing]
 *     summary: Get the processing pipeline status for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Processing status.
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
 * /resume-processing/{resumeId}:
 *   get:
 *     tags: [Resume Processing]
 *     summary: Get the processing pipeline record for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Processing record.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:resumeId', validate(resumeIdParamSchema), controller.getRecord);

export default router;
