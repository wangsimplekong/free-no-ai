import { logger } from '../index';
import { formatError } from '../formatters/error.formatter';
import { getTimestamp } from '../formatters/time.formatter';

/**
 * Sets up global process error handlers
 */
export const setupProcessHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    const formattedError = formatError(error, 'UncaughtException');
    
    logger.fatal({
      msg: 'Uncaught Exception',
      timestamp: getTimestamp(),
      error: formattedError,
      processInfo: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage()
      }
    });

    // Give logger time to flush before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const formattedError = formatError(error, 'UnhandledRejection');

    logger.error({
      msg: 'Unhandled Promise Rejection',
      timestamp: getTimestamp(),
      error: formattedError,
      promise: {
        state: 'pending',
        stack: (promise as any)?.stack
      },
      processInfo: {
        pid: process.pid,
        nodeVersion: process.version
      }
    });
  });

  // Handle worker thread errors
  process.on('worker', (error: Error) => {
    const formattedError = formatError(error, 'WorkerError');

    logger.error({
      msg: 'Worker Thread Error',
      timestamp: getTimestamp(),
      error: formattedError,
      processInfo: {
        pid: process.pid,
        threadId: process.threadId
      }
    });
  });

  // Handle process warnings
  process.on('warning', (warning: Error) => {
    const formattedError = formatError(warning, 'ProcessWarning');

    logger.warn({
      msg: 'Process Warning',
      timestamp: getTimestamp(),
      warning: formattedError,
      processInfo: {
        pid: process.pid,
        nodeVersion: process.version
      }
    });
  });

  // Handle graceful shutdown
  const gracefulShutdown = (signal: string) => {
    logger.info({
      msg: 'Received shutdown signal',
      signal,
      timestamp: getTimestamp(),
      processInfo: {
        pid: process.pid,
        uptime: process.uptime()
      }
    });

    // Perform cleanup tasks here
    setTimeout(() => {
      logger.info({
        msg: 'Process terminated',
        signal,
        timestamp: getTimestamp()
      });
      process.exit(0);
    }, 1000);
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Log process startup
  logger.info({
    msg: 'Process handlers initialized',
    timestamp: getTimestamp(),
    processInfo: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV
    }
  });
};

/**
 * Formats process memory usage information
 */
const formatMemoryUsage = (memoryUsage: NodeJS.MemoryUsage): Record<string, string> => {
  const formatBytes = (bytes: number): string => {
    return `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
  };

  return {
    rss: formatBytes(memoryUsage.rss),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    external: formatBytes(memoryUsage.external),
    arrayBuffers: formatBytes(memoryUsage.arrayBuffers || 0)
  };
};

/**
 * Monitors process memory usage and logs if exceeds threshold
 */
export const setupMemoryMonitoring = (thresholdMB: number = 1024): void => {
  const checkMemory = () => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

    if (heapUsedMB > thresholdMB) {
      logger.warn({
        msg: 'High memory usage detected',
        timestamp: getTimestamp(),
        memory: formatMemoryUsage(memoryUsage),
        threshold: `${thresholdMB} MB`
      });
    }
  };

  // Check memory usage every 5 minutes
  setInterval(checkMemory, 5 * 60 * 1000);
};