import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { DashboardController } from './dashboard.controller';

const router = Router();
const controller = new DashboardController();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get the current user's dashboard summary (resume status, timeline, completion %)
 *     responses:
 *       200:
 *         description: Dashboard summary.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/', controller.getDashboard);

export default router;
