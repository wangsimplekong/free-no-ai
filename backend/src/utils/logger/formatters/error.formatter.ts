import { ApiError } from '../../../middlewares/error.middleware';
import { getTimestamp } from './time.formatter';

interface ErrorDetails {
  message: string;
  name: string;
  code?: string | number;
  statusCode?: number;
  stack?: string;
  cause?: unknown;
  context?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface ErrorResponse {
  code: number;
  message: string;
  timestamp: number;
  stack?: string;
  details?: Record<string, any>;
}

/**
 * Formats an error object for logging purposes
 * @param error The error to format
 * @param context Optional context information
 * @returns Formatted error details
 */
export const formatError = (error: Error | ApiError, context?: string): ErrorDetails => {
  const baseError: ErrorDetails = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: getTimestamp(),
    context: context || 'UnknownContext'
  };

  // Handle ApiError specific properties
  if (error instanceof ApiError) {
    return {
      ...baseError,
      statusCode: error.statusCode,
      code: error.statusCode,
    };
  }

  // Handle other types of errors
  if (error instanceof TypeError) {
    return {
      ...baseError,
      code: 'TYPE_ERROR',
    };
  }

  if (error instanceof ReferenceError) {
    return {
      ...baseError,
      code: 'REFERENCE_ERROR',
    };
  }

  // Handle errors with additional properties
  const additionalProps: Record<string, any> = {};
  Object.getOwnPropertyNames(error).forEach(prop => {
    if (!['name', 'message', 'stack'].includes(prop)) {
      additionalProps[prop] = (error as any)[prop];
    }
  });

  if (Object.keys(additionalProps).length > 0) {
    baseError.metadata = additionalProps;
  }

  // Handle errors with cause
  if ('cause' in error && error.cause) {
    baseError.cause = error.cause;
  }

  return baseError;
};

/**
 * Formats an error for HTTP response
 * @param error The error to format
 * @returns Formatted error response
 */
export const formatErrorResponse = (error: Error | ApiError): ErrorResponse => {
  const isApiError = error instanceof ApiError;
  const response: ErrorResponse = {
    code: isApiError ? error.statusCode : 500,
    message: error.message || 'Internal Server Error',
    timestamp: Date.now()
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = {
      name: error.name,
      ...(error instanceof ApiError && { statusCode: error.statusCode }),
      ...('cause' in error && error.cause && { cause: error.cause })
    };
  }

  return response;
};

/**
 * Extracts a clean stack trace from an error
 * @param error The error to extract the stack trace from
 * @returns Formatted stack trace
 */
export const getCleanStack = (error: Error): string[] => {
  if (!error.stack) return [];
  
  return error.stack
    .split('\n')
    .slice(1) // Remove the error message line
    .map(line => line.trim())
    .filter(line => line.startsWith('at '))
    .map(line => {
      // Extract filename and line number
      const match = line.match(/at (?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))\)?/);
      if (!match) return line;

      const [, fnName, fileName, lineNo, colNo] = match;
      return {
        function: fnName || 'anonymous',
        fileName,
        line: parseInt(lineNo, 10),
        column: parseInt(colNo, 10)
      };
    });
};

/**
 * Creates a standardized error context object
 * @param error The error to contextualize
 * @param additionalContext Additional context information
 * @returns Error context object
 */
export const createErrorContext = (
  error: Error | ApiError,
  additionalContext?: Record<string, any>
): Record<string, any> => {
  return {
    timestamp: getTimestamp(),
    error: formatError(error),
    stack: getCleanStack(error),
    ...additionalContext
  };
};