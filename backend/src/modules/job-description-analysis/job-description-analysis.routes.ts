import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { JobDescriptionAnalysisController } from './job-description-analysis.controller';
import { analyzeJobDescriptionSchema, resumeIdParamSchema } from './job-description-analysis.validation';

const router = Router();
const controller = new JobDescriptionAnalysisController();

// All job-description-analysis routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /job-description-analysis/analyze:
 *   post:
 *     tags: [Job Description Analysis]
 *     summary: Compare a resume against a job description via AI (matching/missing skills, extracted requirements, learning roadmap)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId, jobDescription]
 *             properties:
 *               resumeId: { type: string }
 *               jobDescription: { type: string, description: 'Raw job description text.' }
 *     responses:
 *       200:
 *         description: Analysis started (or cached result reused).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/analyze', validate(analyzeJobDescriptionSchema), controller.analyze);

/**
 * @openapi
 * /job-description-analysis/reanalyze:
 *   post:
 *     tags: [Job Description Analysis]
 *     summary: Force a fresh AI comparison, bypassing any cached result
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId, jobDescription]
 *             properties:
 *               resumeId: { type: string }
 *               jobDescription: { type: string }
 *     responses:
 *       200:
 *         description: Reanalysis started.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/reanalyze', validate(analyzeJobDescriptionSchema), controller.reanalyze);

/**
 * @openapi
 * /job-description-analysis/status/{resumeId}:
 *   get:
 *     tags: [Job Description Analysis]
 *     summary: Get the JD-comparison status for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analysis status.
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
 * /job-description-analysis/{resumeId}:
 *   get:
 *     tags: [Job Description Analysis]
 *     summary: Get the JD-comparison result for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analysis record.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:resumeId', validate(resumeIdParamSchema), controller.getRecord);

export default router;
