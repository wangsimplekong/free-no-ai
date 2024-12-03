import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { getLoggerConfig, getLogFilePath } from './config/logger.config';
import { setupProcessHandlers, setupMemoryMonitoring } from './handlers/process.handler';
import { LogLevel, LogMessage, LogContext, BusinessLogPayload } from './types/logger.types';

// Ensure logs directory exists
const config = getLoggerConfig();
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

// Create transport targets based on environment
const createTransports = () => {
  const targets: pino.TransportTargetOptions[] = [];

  // Add file transports
  targets.push({
    target: 'pino/file',
    level: 'error',
    options: { destination: getLogFilePath('error') }
  });

  targets.push({
    target: 'pino/file',
    level: 'info',
    options: { destination: getLogFilePath('info') }
  });

  targets.push({
    target: 'pino/file',
    level: 'info',
    options: { destination: getLogFilePath('access') },
    filter: (info) => info.type === 'access'
  });

  // Add console transport in development
  if (config.console || process.env.NODE_ENV === 'development') {
    targets.push({
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageFormat: '{msg} {context} {error}',
        errorLikeObjectKeys: ['err', 'error'],
        customPrettifiers: {
          time: (timestamp: string) => `🕒 ${timestamp}`,
          level: (level: string) => `${level.toUpperCase()}:`
        }
      }
    });
  }

  return targets;
};

// Create the logger instance
export const logger = pino({
  level: config.level || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
    bindings: () => ({})
  },
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'refreshToken',
      'headers.authorization',
      'headers.cookie',
      'body.password'
    ],
    censor: '[REDACTED]'
  }
}, pino.transport({
  targets: createTransports()
}));

// Initialize process handlers and memory monitoring
setupProcessHandlers();
setupMemoryMonitoring();

// Business operation logger
export const logBusinessOperation = (payload: BusinessLogPayload): void => {
  logger.info({
    type: 'business',
    timestamp: new Date().toISOString(),
    ...payload
  });
};

// Request logger
export const logRequest = (context: LogContext): void => {
  logger.info({
    type: 'access',
    timestamp: new Date().toISOString(),
    ...context
  });
};

// Custom level logging with context
export const log = (
  level: LogLevel,
  message: string,
  context?: Record<string, any>
): void => {
  const logMessage: LogMessage = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: context?.context,
    metadata: context
  };

  logger[level](logMessage);
};

// Error logger with stack trace
export const logError = (
  error: Error,
  context?: Record<string, any>
): void => {
  logger.error({
    type: 'error',
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack
    },
    context
  });
};

// Performance logger
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
): void => {
  logger.info({
    type: 'performance',
    timestamp: new Date().toISOString(),
    operation,
    duration,
    slow: duration > 1000,
    ...metadata
  });
};

// Security logger
export const logSecurity = (
  event: string,
  details: Record<string, any>
): void => {
  logger.warn({
    type: 'security',
    timestamp: new Date().toISOString(),
    event,
    ...details
  });
};

export * from './types/logger.types';
export * from './formatters/error.formatter';
export * from './formatters/time.formatter';
export * from './formatters/request.formatter';