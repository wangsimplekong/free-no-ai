export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
  trace?: string;
}

export interface LoggerOptions {
  level: LogLevel;
  format?: string;
  maxFiles?: string;
  maxSize?: string;
  path?: string;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface BusinessLogPayload {
  action: string;
  module: string;
  userId?: string;
  details?: Record<string, any>;
}

export interface LogMetadata {
  [key: string]: any;
  timestamp?: string;
  context?: string;
  trace?: string;
}