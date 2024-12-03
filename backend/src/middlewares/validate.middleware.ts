import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      context: 'ValidationMiddleware',
      errors: errors.array(),
      body: req.body,
      path: req.path
    });

    return res.status(400).json({
      code: 400,
      message: 'Validation failed',
      errors: errors.array(),
      timestamp: Date.now()
    });
  }
  next();
};