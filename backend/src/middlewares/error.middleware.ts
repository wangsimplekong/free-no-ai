import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { formatError, formatErrorResponse } from '../utils/logger/formatters/error.formatter';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorDetails = {
    msg: 'Error Handler',
    context: 'ErrorMiddleware',
    ...formatError(err),
    request: {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined
      },
      ip: req.ip,
      originalUrl: req.originalUrl
    }
  };

  logger.error(errorDetails);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      timestamp: Date.now(),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: errorDetails
      })
    });
  }

  return res.status(500).json(formatErrorResponse(err));
};