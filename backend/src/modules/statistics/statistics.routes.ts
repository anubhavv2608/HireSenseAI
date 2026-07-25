import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { StatisticsController } from './statistics.controller';

const router = Router();
const controller = new StatisticsController();

router.use(authenticate);

/**
 * @openapi
 * /statistics:
 *   get:
 *     tags: [Statistics]
 *     summary: Get platform-wide usage statistics
 *     responses:
 *       200:
 *         description: Statistics snapshot.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/', controller.getStatistics);

export default router;
