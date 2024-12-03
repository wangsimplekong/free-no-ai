import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/token.service';
import { logger } from '../utils/logger';

const tokenService = new TokenService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Special handling for logout endpoint
    if (req.path === '/logout' && (!authHeader || !authHeader.startsWith('Bearer '))) {
      (req as any).user = { id: null };
      next();
      return;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        code: 401,
        message: 'No token provided',
        timestamp: Date.now(),
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await tokenService.verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token payload');
    }

    logger.info('User authenticated', {
      userId: decoded.userId,
      path: req.path
    });

    (req as any).user = { id: decoded.userId };
    next();
  } catch (error) {
    // Special handling for logout endpoint
    if (req.path === '/logout') {
      (req as any).user = { id: null };
      next();
      return;
    }

    logger.error('Auth middleware error:', {
      error,
      headers: req.headers,
      path: req.path
    });
    res.status(401).json({
      code: 401,
      message: 'Invalid token',
      timestamp: Date.now(),
    });
  }
};