import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { formatDuration } from '../utils/logger/formatters/time.formatter';
import { v4 as uuidv4 } from 'uuid';

export const requestLoggerMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate unique request ID if not exists
    req.id = req.headers['x-request-id'] as string || uuidv4();
    res.setHeader('X-Request-ID', req.id);

    const startTime = Date.now();

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      // Only log non-successful responses or slow requests
      if (res.statusCode >= 400 || duration > 1000) {
        logger[res.statusCode >= 400 ? 'error' : 'warn']({
          msg: res.statusCode >= 400 ? 'Request failed' : 'Slow request detected',
          requestId: req.id,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: formatDuration(duration),
          ...(res.statusCode >= 400 && {
            body: req.body,
            query: req.query,
            params: req.params
          })
        });
      }
    });

    // Log request errors
    res.on('error', (error: Error) => {
      logger.error({
        msg: 'Request error',
        requestId: req.id,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        request: {
          method: req.method,
          url: req.originalUrl
        }
      });
    });

    next();
  };
};