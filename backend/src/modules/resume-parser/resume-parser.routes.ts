import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ResumeParserController } from './resume-parser.controller';
import { parseResumeSchema, resumeIdParamSchema } from './resume-parser.validation';

const router = Router();
const controller = new ResumeParserController();

// All resume-parser routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /resume-parser/parse:
 *   post:
 *     tags: [Resume Parser]
 *     summary: Extract structured data (contact, education, experience, skills, projects) from a resume via AI
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
 *         description: Parsing started (or cached result reused).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/parse', validate(parseResumeSchema), controller.parse);

/**
 * @openapi
 * /resume-parser/reparse:
 *   post:
 *     tags: [Resume Parser]
 *     summary: Force a fresh AI parse, bypassing any cached result
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
 *         description: Reparsing started.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.post('/reparse', validate(parseResumeSchema), controller.reparse);

/**
 * @openapi
 * /resume-parser/status/{resumeId}:
 *   get:
 *     tags: [Resume Parser]
 *     summary: Get the parsing status for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Parsing status.
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
 * /resume-parser/{resumeId}:
 *   get:
 *     tags: [Resume Parser]
 *     summary: Get the structured parse result for a resume
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Parse record.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.get('/:resumeId', validate(resumeIdParamSchema), controller.getRecord);

export default router;
