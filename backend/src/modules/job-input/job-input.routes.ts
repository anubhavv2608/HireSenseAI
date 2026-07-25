import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middleware/auth';
import { JobInputController } from './job-input.controller';
import { JOB_INPUT_CONSTANTS } from './job-input.constants';

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: JOB_INPUT_CONSTANTS.MAX_FILE_SIZE_BYTES,
  },
});

const router = Router();
const controller = new JobInputController();

router.use(authenticate);

/**
 * @openapi
 * /job-input/extract:
 *   post:
 *     tags: [Job Input]
 *     summary: Extract text from an uploaded job description file (PDF/image)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Extracted job description text.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/extract', uploadMiddleware.single('file'), controller.extract);

export default router;
