import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint for deployment monitoring.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'BreakBuddy server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
