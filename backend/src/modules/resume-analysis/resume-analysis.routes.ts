import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ResumeAnalysisController } from './resume-analysis.controller';
import { analyzeResumeSchema, resumeIdParamSchema } from './resume-analysis.validation';

const router = Router();
const controller = new ResumeAnalysisController();

// All resume-analysis routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /resume-analysis/analyze:
 *   post:
 *     tags: [Resume Analysis]
 *     summary: Run AI scoring/feedback analysis on a resume (category + detailed scores, strengths, weaknesses, recommendations)
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
 *         description: Analysis started (or cached result reused).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/analyze', validate(analyzeResumeSchema), controller.analyze);

/**
 * @openapi
 * /resume-analysis/reanalyze:
 *   post:
 *     tags: [Resume Analysis]
 *     summary: Force a fresh AI analysis, bypassing any cached result
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
 *         description: Reanalysis started.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/reanalyze', validate(analyzeResumeSchema), controller.reanalyze);

/**
 * @openapi
 * /resume-analysis/status/{resumeId}:
 *   get:
 *     tags: [Resume Analysis]
 *     summary: Get the analysis status for a resume
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
 * /resume-analysis/{resumeId}:
 *   get:
 *     tags: [Resume Analysis]
 *     summary: Get the analysis result for a resume
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
