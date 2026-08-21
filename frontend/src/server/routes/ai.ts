import { Router, Request, Response, NextFunction } from 'express';
import { geminiService, WellnessTipRequest } from '../services/geminiService';
import { AppError } from '../middleware/errorHandler';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const VALID_CATEGORIES = ['eyes', 'stretch', 'breathing', 'posture', 'general'] as const;

/**
 * POST /api/v1/ai/wellness-tip
 * Generate an AI-powered personalized wellness tip.
 * Rate limited to 10 requests per minute per IP.
 */
router.post(
  '/wellness-tip',
  rateLimiter(10, 60 * 1000),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if AI service is available
      if (!geminiService.isAvailable()) {
        throw new AppError(
          'AI service is not configured',
          503,
          'SERVICE_UNAVAILABLE'
        );
      }

      // Validate request body
      const { category, focusMinutes, context } = req.body || {};
      const errors: string[] = [];

      if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
        errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }

      if (focusMinutes !== undefined) {
        if (typeof focusMinutes !== 'number' || focusMinutes < 0 || focusMinutes > 1440) {
          errors.push('focusMinutes must be a number between 0 and 1440');
        }
      }

      if (context !== undefined && typeof context !== 'string') {
        errors.push('context must be a string');
      }

      if (errors.length > 0) {
        throw new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors);
      }

      // Build request
      const tipRequest: WellnessTipRequest = {
        category: category || 'general',
        focusMinutes: typeof focusMinutes === 'number' ? focusMinutes : undefined,
        context: typeof context === 'string' ? context.slice(0, 200) : undefined,
      };

      // Generate tip
      const tip = await geminiService.generateWellnessTip(tipRequest);

      res.json({
        success: true,
        data: tip,
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      console.error('[ai] Gemini API error:', (error as Error).message);
      next(new AppError('Failed to generate wellness tip', 500, 'AI_SERVICE_ERROR'));
    }
  }
);

/**
 * GET /api/v1/ai/status
 * Check if the AI service is available (no API key needed on the client).
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      available: geminiService.isAvailable(),
    },
  });
});

export default router;
