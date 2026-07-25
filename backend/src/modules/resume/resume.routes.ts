import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { ResumeController } from './resume.controller';
import { resumeIdParamSchema } from './resume.validation';
import { STORAGE_CONSTANTS } from '../../shared/storage/constants';

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: STORAGE_CONSTANTS.MAX_FILE_SIZE_BYTES,
  },
});

const router = Router();
const controller = new ResumeController();

// All resume routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /resume/upload:
 *   post:
 *     tags: [Resume]
 *     summary: Upload a resume (PDF/image), creating the first version
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Resume uploaded.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/upload', uploadMiddleware.single('file'), controller.uploadResume);

/**
 * @openapi
 * /resume/replace:
 *   post:
 *     tags: [Resume]
 *     summary: Upload a new resume version, replacing the active one
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: New version uploaded and made active.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/replace', uploadMiddleware.single('file'), controller.replaceResume);

/**
 * @openapi
 * /resume/current:
 *   get:
 *     tags: [Resume]
 *     summary: Get the current user's active resume
 *     responses:
 *       200:
 *         description: Active resume.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/current', controller.getActiveResume);

/**
 * @openapi
 * /resume/history:
 *   get:
 *     tags: [Resume]
 *     summary: List all resume versions for the current user
 *     responses:
 *       200:
 *         description: Resume version history.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/history', controller.getResumeHistory);

/**
 * @openapi
 * /resume/{id}/active:
 *   patch:
 *     tags: [Resume]
 *     summary: Mark a specific resume version as active
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resume marked active.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.patch('/:id/active', validate(resumeIdParamSchema), controller.setActiveResume);

/**
 * @openapi
 * /resume/{id}:
 *   delete:
 *     tags: [Resume]
 *     summary: Delete a resume version
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resume deleted.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
router.delete('/:id', validate(resumeIdParamSchema), controller.deleteResume);

export default router;
