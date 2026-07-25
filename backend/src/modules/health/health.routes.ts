import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { config } from '../../shared/config';
import { asyncHandler } from '../../shared/utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Full health check (uptime, version, DB connectivity)
 *     security: []
 *     responses:
 *       200:
 *         description: System health snapshot.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.status(200).json(
      ApiResponse.success('System is healthy', {
        status: 'UP',
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.env,
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      })
    );
  })
);

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe (200 if DB connected, 503 otherwise)
 *     security: []
 *     responses:
 *       200: { description: Ready to accept traffic. }
 *       503: { description: Database disconnected. }
 */
router.get('/ready', (_req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    res.status(200).json(ApiResponse.success('System is ready to accept traffic'));
  } else {
    res.status(503).json(ApiResponse.error('System is not ready. Database disconnected.'));
  }
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     security: []
 *     responses:
 *       200: { description: Process is alive. }
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success('System is alive'));
});

export default router;
